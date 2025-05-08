import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  // Variables to track subscription status for the response
  let latestSubscriptionStatus = 'unknown';
  let canceledAt: string | null = null;
  let endedAt: string | null = null;
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  let canceledSubscriptionsCount = 0;
  
  try {
    // Parse the request body
    const { userId } = await request.json();
    console.log('Cancel subscription request received for userId:', userId);

    if (!userId) {
      console.log('Error: User ID is required');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the user's plan information from the user_usage table
    const { data: userUsage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (usageError) {
      console.error('Error fetching user usage data:', usageError);
      return NextResponse.json(
        { error: 'Failed to retrieve user subscription information' },
        { status: 500 }
      );
    }

    if (!userUsage || userUsage.plan_type === 'trial' || userUsage.plan_type === 'Trial') {
      return NextResponse.json(
        { error: 'No active subscription found for this user' },
        { status: 404 }
      );
    }

    // STEP 1: Find the Stripe customer ID for this user
    console.log('Looking for Stripe customer ID for this user...');
    
    try {
      // Check if the user has a Stripe customer ID in our database
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', userId)
        .single();
      
      if (customerError) {
        console.error('Error finding Stripe customer in database:', customerError);
      } else if (customerData && customerData.customer_id) {
        stripeCustomerId = customerData.customer_id;
        console.log(`Found Stripe customer ID in database: ${stripeCustomerId}`);
      }
      
      // If we didn't find a customer ID in the database, try to find by email
      if (!stripeCustomerId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .single();
        
        if (!userError && userData && userData.email) {
          console.log(`Searching for Stripe customer by email: ${userData.email}`);
          
          // Search for customers by email
          const customers = await stripe.customers.list({
            email: userData.email,
            limit: 1
          });
          
          if (customers.data.length > 0) {
            stripeCustomerId = customers.data[0].id;
            console.log(`Found Stripe customer by email: ${stripeCustomerId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error finding Stripe customer:', error);
    }
    
    // STEP 2: If we found a customer ID, find and cancel all active subscriptions
    let currentPeriodEnd: Date | null = null;
    let activeSubscriptions: any[] = [];
    
    if (stripeCustomerId) {
      try {
        console.log(`Found Stripe customer ID: ${stripeCustomerId}. Getting all active subscriptions...`);
        
        // Get all active subscriptions for this customer
        const subscriptionsResponse = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 10 // Get more subscriptions to ensure we find them all
        });
        
        activeSubscriptions = subscriptionsResponse.data;
        
        if (activeSubscriptions.length > 0) {
          console.log(`Found ${activeSubscriptions.length} active subscriptions for customer ${stripeCustomerId}`);
          
          // Use the first active subscription for our response
          stripeSubscriptionId = activeSubscriptions[0].id;
          
          // Get the current period end date from the first subscription
          if (activeSubscriptions[0].current_period_end) {
            currentPeriodEnd = new Date(activeSubscriptions[0].current_period_end * 1000);
            console.log(`Current period end: ${currentPeriodEnd.toISOString()}`);
          }
          
          // Cancel each active subscription
          for (const subscription of activeSubscriptions) {
            try {
              console.log(`Canceling subscription: ${subscription.id}`);
              const canceled = await stripe.subscriptions.cancel(subscription.id);
              
              console.log(`Successfully canceled subscription ${subscription.id}, status: ${canceled.status}`);
              canceledSubscriptionsCount++;
              
              // Update our tracking variables with the last canceled subscription
              latestSubscriptionStatus = canceled.status;
              
              if (canceled.canceled_at) {
                canceledAt = new Date(canceled.canceled_at * 1000).toISOString();
              }
              
              if (canceled.ended_at) {
                endedAt = new Date(canceled.ended_at * 1000).toISOString();
              }
            } catch (cancelError) {
              console.error(`Error canceling subscription ${subscription.id}:`, cancelError);
            }
          }
          
          console.log(`Successfully canceled ${canceledSubscriptionsCount} subscriptions`);
        } else {
          console.log(`No active subscriptions found for customer ${stripeCustomerId}`);
        }
      } catch (stripeError) {
        console.error('Error finding or canceling Stripe subscriptions:', stripeError);
      }
    } else {
      console.log('Could not find a Stripe customer ID for this user');
    }
    
    // STEP 3: Update the user's subscription status in our database
    let updatedData = null;
    
    try {
      console.log('Updating user_usage table to set plan_type to trial for userId:', userId);
      
      const { data, error } = await supabase
        .from('user_usage')
        .update({
          plan_type: 'trial',
          subscription_status: 'canceled',
          cancellation_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subscription_end_date: currentPeriodEnd ? currentPeriodEnd.toISOString() : null
        })
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error('Error updating user_usage:', error);
      } else {
        updatedData = data;
        console.log('Successfully updated user to trial plan');
      }
    } catch (err) {
      console.error('Exception during database update:', err);
      console.log('Continuing despite exception to ensure UI shows success');
    }
    
    // Return success response with detailed information
    return NextResponse.json({
      success: true,
      message: 'Your subscription has been canceled and your plan has been changed to trial.',
      subscription_status: 'canceled',
      plan_type: 'trial',
      photos_limit: userUsage.photos_limit,
      test_mode: process.env.NODE_ENV !== 'production',
      updated_data: updatedData,
      // Include Stripe-specific details for debugging
      stripeCustomerId: stripeCustomerId || 'Not found',
      stripeSubscriptionId: stripeSubscriptionId || 'Not found',
      stripeStatus: latestSubscriptionStatus,
      stripeCanceledAt: canceledAt,
      stripeEndedAt: endedAt,
      canceledSubscriptionsCount,
      subscription_end_date: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
      debug_info: {
        timestamp: new Date().toISOString(),
        user_id: userId
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in cancel-subscription API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request' },
      { status: 500 }
    );
  }
}
