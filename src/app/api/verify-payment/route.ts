import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    console.log('Received payment verification request');
    
    const body = await req.json();
    const { sessionId, userId: providedUserId } = body;
    
    if (!sessionId) {
      console.error('Missing sessionId in request');
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }
    
    console.log('Provided user ID from request:', providedUserId);
    
    console.log('Retrieving checkout session:', sessionId);
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });
    
    if (!session) {
      console.error('Session not found:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    console.log('Session status:', session.status);
    console.log('Payment status:', session.payment_status);
    
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      console.error('Payment not completed:', session.status, session.payment_status);
      return NextResponse.json({ 
        error: 'Payment not completed',
        status: session.status,
        paymentStatus: session.payment_status
      }, { status: 400 });
    }
    
    // Get the user ID - prioritize the one provided in the request over the client reference ID
    let userId = providedUserId || session.client_reference_id;
    
    if (!userId) {
      console.error('No user ID found in request or session');
      return NextResponse.json({ error: 'No user ID associated with this payment' }, { status: 400 });
    }
    
    console.log('Using user ID for subscription update:', userId);
    
    // Get the subscription ID
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      console.error('No subscription ID in session');
      return NextResponse.json({ error: 'No subscription associated with this payment' }, { status: 400 });
    }
    
    console.log('Subscription ID:', subscriptionId);
    
    // Get the customer ID
    const customerId = session.customer as string;
    if (!customerId) {
      console.error('No customer ID in session');
      return NextResponse.json({ error: 'No customer associated with this payment' }, { status: 400 });
    }
    
    console.log('Customer ID:', customerId);
    
    // Get user information from consolidated_users table
    const { data: userData, error: userError } = await supabase
      .from('consolidated_users')
      .select('email')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user:', userError);
      // Continue with the process even if user not found in consolidated_users
      console.log('User not found in consolidated_users, but proceeding with subscription activation');
    }
    
    const userEmail = userData?.email || 'customer@example.com'; // Fallback email if not found
    
    // Store or update the customer ID in the database - create the table if it doesn't exist
    try {
      // First check if the stripe_customers table exists
      const { error: tableCheckError } = await supabase
        .from('stripe_customers')
        .select('count')
        .limit(1)
        .single();
      
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.log('stripe_customers table does not exist, skipping customer storage');
      } else {
        // Store customer info if table exists
        const { error: customerError } = await supabase
          .from('stripe_customers')
          .upsert([{
            user_id: userId,
            customer_id: customerId,
            email: userEmail,
            subscription_id: session.subscription?.toString() || null // Store the subscription ID if available
          }]);
          
        if (customerError) {
          console.error('Error storing customer ID:', customerError);
          // Continue anyway, don't fail the whole process
        }
      }
    } catch (error) {
      console.error('Error handling stripe_customers:', error);
      // Continue anyway, don't fail the whole process
    }
    
    // Update user_usage table with subscription information
    try {
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (usageError && !usageError.message.includes('does not exist')) {
        console.error('Error fetching user usage:', usageError);
      }
      
      // Determine which plan was purchased based on the price ID and amount
      const priceId = session.line_items?.data[0]?.price?.id || '';
      const amount = session.amount_total || 0;
      
      // Log the price ID and amount for debugging
      console.log('Price ID:', priceId);
      console.log('Amount total:', amount);
      
      // Better determination of plan type based on price ID and amount
      // Agency plan is typically higher priced (around $397)
      let planType = 'standard';
      
      // Check if amount is higher than $300 (30000 cents) - likely agency plan
      if (amount >= 30000) {
        planType = 'agency';
      } else if (priceId.includes('agency')) {
        planType = 'agency';
      }
      
      console.log('Determined plan type:', planType);
      
      // Photos limit based on plan type
      const photosLimit = planType === 'agency' ? 300 : 50;
      console.log('Setting photos limit to:', photosLimit);
      
      if (usageData) {
        // Get current photos limit (if any)
        const currentPhotosLimit = usageData.photos_limit || 0;
        
        // Add new limit to existing limit instead of replacing
        const newPhotosLimit = currentPhotosLimit + photosLimit;
        
        console.log('Updating photos limit: current =', currentPhotosLimit, '+ new =', photosLimit, '= total =', newPhotosLimit);
        
        // Update existing user usage record with the correct fields based on the actual schema
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({
            plan_type: planType,
            photos_limit: newPhotosLimit,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Error updating user usage:', updateError);
        } else {
          console.log('Successfully updated user_usage record to', planType, 'plan with', photosLimit, 'photos limit');
        }
      } else {
        // Create new user usage record with the correct fields
        const { error: insertError } = await supabase
          .from('user_usage')
          .insert([{
            user_id: userId,
            plan_type: planType,
            photos_limit: photosLimit,
            photos_used: 0,
            email: userEmail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (insertError) {
          console.error('Error inserting user usage:', insertError);
        } else {
          console.log('Successfully created new user_usage record');
        }
      }
    } catch (error) {
      console.error('Error handling user_usage update:', error);
      // Continue anyway, don't fail the whole process
    }
    
    // Also update consolidated_users table
    try {
      // First check if the user exists in consolidated_users
      const { data: consolidatedData, error: checkError } = await supabase
        .from('consolidated_users')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (checkError && !checkError.message.includes('does not exist')) {
        console.error('Error checking consolidated_users:', checkError);
      }
      
      // Determine which plan was purchased based on the price ID
      const priceId = session.line_items?.data[0]?.price?.id || '';
      const planType = priceId.includes('standard') ? 'standard' : 
                      priceId.includes('agency') ? 'agency' : 'standard';
      
      // Photos limit and credits based on plan type
      const photosLimit = planType === 'agency' ? 300 : 50;
      
      if (consolidatedData) {
        // Add new credits to existing balance instead of resetting
        const existingCredits = consolidatedData.credits_remaining || 0;
        const photosUsed = consolidatedData.photos_used || 0;
        const newTotalCredits = existingCredits + photosLimit;
        
        console.log('Adding credits: existing =', existingCredits, '+ new =', photosLimit, '= total =', newTotalCredits);
        console.log('Current photos used:', photosUsed);
        
        // Update existing consolidated_users record
        // Note: We can't directly update credits_remaining due to database constraints
        // Instead, we update photos_limit which affects the calculated credits_remaining value
        const { error: updateError } = await supabase
          .from('consolidated_users')
          .update({
            plan_type: planType,
            photos_limit: newTotalCredits + photosUsed, // Add photos_used to ensure correct credits_remaining
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Error updating consolidated_users:', updateError);
        } else {
          console.log('Successfully updated consolidated_users record to', planType, 'plan with', newTotalCredits, 'credits remaining');
        }
      } else {
        // Create new consolidated_users record if it doesn't exist
        const { error: insertError } = await supabase
          .from('consolidated_users')
          .insert([{
            user_id: userId,
            email: userEmail,
            plan_type: planType,
            photos_limit: photosLimit,
            photos_used: 0,
            credits_remaining: photosLimit,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (insertError) {
          console.error('Error inserting consolidated_users:', insertError);
        } else {
          console.log('Successfully created new consolidated_users record');
        }
      }
    } catch (error) {
      console.error('Error handling consolidated_users update:', error);
      // Continue anyway, don't fail the whole process
    }
    
    console.log('Successfully updated user subscription status');
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment verified and subscription activated'
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
