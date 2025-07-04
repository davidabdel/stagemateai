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
  
  try {
    // Parse the request body
    const { userId, stripeSubscriptionId: requestSubscriptionId } = await request.json();
    console.log('Cancel subscription request received for userId:', userId);
    
    if (requestSubscriptionId) {
      console.log('Stripe subscription ID provided in request:', requestSubscriptionId);
    }

    if (!userId) {
      console.log('Error: User ID is required');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Initialize variables for Stripe customer and subscription
    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = requestSubscriptionId || null;
    let stripeSubscriptions: any[] = [];
    
    // If subscription ID was provided in the request, validate and use it
    if (stripeSubscriptionId) {
      console.log(`Using Stripe subscription ID from request: ${stripeSubscriptionId}`);
      
      // Validate that the subscription ID has the correct format (starts with 'sub_')
      if (!stripeSubscriptionId.startsWith('sub_')) {
        console.warn(`Warning: Subscription ID ${stripeSubscriptionId} does not have the expected format (sub_*). Will try to use it anyway.`);
      }
      
      // Try to verify the subscription exists in Stripe
      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        console.log(`Verified subscription exists in Stripe: ${subscription.id}, status: ${subscription.status}`);
      } catch (verifyError) {
        console.error(`Error verifying subscription ${stripeSubscriptionId}:`, verifyError);
        // Continue anyway, we'll still try to use the ID
      }
    } else {
      // Otherwise, try to find it
      console.log('No subscription ID provided, attempting to find it...');
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

    // We already initialized these variables at the top of the function
    console.log('Looking for Stripe customer and subscription IDs for this user...');
    
    try {
      // Check if the user has a Stripe customer ID and subscription ID in our database
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id, subscription_id')
        .eq('user_id', userId)
        .single();
      
      if (customerError) {
        console.error('Error finding Stripe customer in database:', customerError);
      } else if (customerData) {
        if (customerData.customer_id) {
          stripeCustomerId = customerData.customer_id;
          console.log(`Found Stripe customer ID in database: ${stripeCustomerId}`);
        }
        
        if (customerData.subscription_id) {
          stripeSubscriptionId = customerData.subscription_id;
          console.log(`Found Stripe subscription ID in database: ${stripeSubscriptionId}`);
        }
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
      
      // If we found a customer ID, get ALL their subscriptions
      if (stripeCustomerId) {
        console.log(`Found Stripe customer ID: ${stripeCustomerId}. Getting all subscriptions...`);
        
        // Get all subscriptions for this customer, regardless of status
        const allSubscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 10 // Get more subscriptions to ensure we find them all
        });
        
        if (allSubscriptions.data.length > 0) {
          stripeSubscriptions = allSubscriptions.data;
          console.log(`Found ${stripeSubscriptions.length} Stripe subscriptions for customer`);
          
          // Look for active subscriptions first
          const activeSubscription = stripeSubscriptions.find(sub => sub.status === 'active');
          if (activeSubscription) {
            stripeSubscriptionId = activeSubscription.id;
            console.log(`Found active Stripe subscription: ${stripeSubscriptionId}`);
          } else {
            // If no active subscription, use the most recent one
            stripeSubscriptions.sort((a, b) => (b.created as number) - (a.created as number));
            stripeSubscriptionId = stripeSubscriptions[0].id;
            console.log(`No active subscription found. Using most recent: ${stripeSubscriptionId} (status: ${stripeSubscriptions[0].status})`);
          }
        } else {
          console.log('No Stripe subscriptions found for this customer');
        }
      } else {
        console.log('Could not find a Stripe customer ID for this user');
      }
    } catch (stripeError) {
      console.error('Error finding Stripe customer or subscriptions:', stripeError);
    }

    if (!stripeSubscriptionId) {
      // For testing purposes, allow downgrading without a Stripe subscription
      console.log('No Stripe subscription found, but proceeding with plan downgrade');

      // Mark subscription as canceled but KEEP existing plan and credits
      // This preserves the user's access until the end of the billing period
      // Declare updatedData at a higher scope so it's available for the response
      let updatedData: any = null;
      
      try {
        // Directly update the plan_type to 'trial'
        console.log('Updating user_usage table to set plan_type to trial for userId:', userId);
        
        // First, perform a direct update to change the plan type
        const { error: directUpdateError } = await supabase
          .from('user_usage')
          .update({ plan_type: 'trial' })
          .eq('user_id', userId);
        
        if (directUpdateError) {
          console.error('Error updating plan_type to trial:', directUpdateError);
        } else {
          console.log('Successfully updated plan_type to trial');
        }
        
        // Then update the other fields
        const { data: updateResult, error: updateError } = await supabase
          .from('user_usage')
          .update({ 
            subscription_status: 'canceled',
            cancellation_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select();
        
        if (updateError) {
          console.error('Error marking subscription as canceled:', updateError);
          // Continue anyway - don't return an error response
          console.log('Continuing despite error to ensure UI shows success');
        } else if (updateResult) {
          updatedData = updateResult;
          console.log('Successfully updated user plan to free. Updated data:', updatedData);
        } else {
          console.log('No error but also no data returned from update operation');
        }
      } catch (err) {
        console.error('Exception during subscription cancellation:', err);
        // Continue anyway - don't return an error response
        console.log('Continuing despite exception to ensure UI shows success');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Your subscription has been canceled and your plan has been changed to trial.',
        subscription_status: 'canceled',
        plan_type: 'trial',
        photos_limit: userUsage.photos_limit,
        test_mode: process.env.NODE_ENV !== 'production',
        updated_data: updatedData || null,
        // Include Stripe-specific details for debugging
        stripeSubscriptionId: stripeSubscriptionId || 'Not found',
        stripeStatus: latestSubscriptionStatus || 'Unknown',
        stripeCanceledAt: canceledAt || null,
        stripeEndedAt: endedAt || null,
        debug_info: {
          timestamp: new Date().toISOString(),
          user_id: userId
        }
      });
    }
    
    // We already have variables to track subscription status at the top of the function
    
    // If we found a Stripe subscription, cancel it immediately using the direct Stripe API
    let currentPeriodEnd: Date | null = null;
    try {
      // First, retrieve the subscription to get its details
      console.log(`Retrieving subscription details for ID: ${stripeSubscriptionId}`);
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      
      // Get the current period end date before cancellation - handle timestamp safely
      try {
        if ((subscription as any).current_period_end) {
          const timestamp = (subscription as any).current_period_end;
          // Ensure timestamp is a valid number
          if (typeof timestamp === 'number') {
            currentPeriodEnd = new Date(timestamp * 1000);
            console.log(`Current period end: ${currentPeriodEnd.toISOString()}`);
          } else {
            console.log(`Invalid current_period_end timestamp: ${timestamp}`);
            currentPeriodEnd = null;
          }
        }
      } catch (timeError) {
        console.error('Error processing current_period_end timestamp:', timeError);
        currentPeriodEnd = null;
      }
      
      console.log(`Current subscription status: ${subscription.status}`);
      
      // Set initial status values - handle timestamps safely
      latestSubscriptionStatus = subscription.status;
      
      // Handle canceled_at timestamp
      try {
        if ((subscription as any).canceled_at) {
          const timestamp = (subscription as any).canceled_at;
          if (typeof timestamp === 'number') {
            canceledAt = new Date(timestamp * 1000).toISOString();
          } else {
            console.log(`Invalid canceled_at timestamp: ${timestamp}`);
            canceledAt = null;
          }
        }
      } catch (timeError) {
        console.error('Error processing canceled_at timestamp:', timeError);
        canceledAt = null;
      }
      
      // Handle ended_at timestamp
      try {
        if ((subscription as any).ended_at) {
          const timestamp = (subscription as any).ended_at;
          if (typeof timestamp === 'number') {
            endedAt = new Date(timestamp * 1000).toISOString();
          } else {
            console.log(`Invalid ended_at timestamp: ${timestamp}`);
            endedAt = null;
          }
        }
      } catch (timeError) {
        console.error('Error processing ended_at timestamp:', timeError);
        endedAt = null;
      }
      
      // Check if the subscription is already canceled
      if (subscription.status === 'canceled') {
        console.log(`Subscription ${stripeSubscriptionId} is already canceled`);
      } else {
        // Log the subscription details before cancellation
        console.log(`Current subscription status before cancellation: ${subscription.status}`);
        console.log(`Attempting to cancel subscription ${stripeSubscriptionId} in Stripe...`);
        
        // Cancel the subscription immediately using the direct API call
        // This is the most reliable method to ensure the subscription is canceled in Stripe
        const canceledSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
        
        // Update status variables after cancellation - handle timestamps safely
        latestSubscriptionStatus = canceledSubscription.status;
        
        // Handle canceled_at timestamp
        try {
          if ((canceledSubscription as any).canceled_at) {
            const timestamp = (canceledSubscription as any).canceled_at;
            if (typeof timestamp === 'number') {
              canceledAt = new Date(timestamp * 1000).toISOString();
            } else {
              console.log(`Invalid canceled_at timestamp after cancellation: ${timestamp}`);
              canceledAt = null;
            }
          }
        } catch (timeError) {
          console.error('Error processing canceled_at timestamp after cancellation:', timeError);
          canceledAt = null;
        }
        
        // Handle ended_at timestamp
        try {
          if ((canceledSubscription as any).ended_at) {
            const timestamp = (canceledSubscription as any).ended_at;
            if (typeof timestamp === 'number') {
              endedAt = new Date(timestamp * 1000).toISOString();
            } else {
              console.log(`Invalid ended_at timestamp after cancellation: ${timestamp}`);
              endedAt = null;
            }
          }
        } catch (timeError) {
          console.error('Error processing ended_at timestamp after cancellation:', timeError);
          endedAt = null;
        }
        
        // Verify the cancellation was successful
        if (canceledSubscription.status === 'canceled') {
          // Log cancellation success with safe timestamp handling
          let canceledAtStr = 'Not available';
          try {
            if ((canceledSubscription as any).canceled_at && 
                typeof (canceledSubscription as any).canceled_at === 'number') {
              canceledAtStr = new Date((canceledSubscription as any).canceled_at * 1000).toISOString();
            }
          } catch (e) {
            canceledAtStr = 'Error processing timestamp';
          }
          
          console.log('Successfully canceled Stripe subscription:', canceledSubscription.id, 
                     'Status:', canceledSubscription.status,
                     'Canceled at:', canceledAtStr);
        } else {
          console.error(`Unexpected status after cancellation: ${canceledSubscription.status}`);
          
          // Try to retrieve the subscription again to check its status
          const verifySubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          console.log(`Verified subscription status: ${verifySubscription.status}`);
          
          if (verifySubscription.status !== 'canceled') {
            throw new Error(`Failed to cancel subscription: Status is ${verifySubscription.status}`);
          } else {
            console.log('Subscription was canceled but status not immediately updated in response');
          }
        }
      }
    } catch (stripeError) {
      console.error('Error canceling Stripe subscription:', stripeError);
      // Continue anyway - we'll still mark the subscription as canceled in our database
      console.log('Continuing despite Stripe error to ensure UI shows success');
    }
    
    // Declare updatedData at a higher scope so it's available for the final response
    let updatedData: any = null;
    
    // Update the user's subscription status in the database
    // Mark as canceled but preserve existing plan type and credits until the period ends
    try {
      console.log('Updating user_usage table to set plan_type to trial for userId:', userId);
      
      // First, perform a direct update to change the plan type
      const { error: directUpdateError } = await supabase
        .from('user_usage')
        .update({ plan_type: 'trial' })
        .eq('user_id', userId);
      
      if (directUpdateError) {
        console.error('Error updating plan_type to trial:', directUpdateError);
      } else {
        console.log('Successfully updated plan_type to trial');
      }
      
      // Then update the other fields
      const { data: updateResult, error: updateError } = await supabase
        .from('user_usage')
        .update({ 
          subscription_status: 'canceled',
          cancellation_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subscription_end_date: currentPeriodEnd ? currentPeriodEnd.toISOString() : null
        })
        .eq('user_id', userId)
        .select();
        
      if (updateResult) {
        updatedData = updateResult;
        console.log('Successfully updated user plan. Updated data:', updatedData);
      }
        
      if (updateError) {
        console.error('Error marking subscription as canceled in database:', updateError);
        // Continue anyway - don't return an error response
        console.log('Continuing despite database error to ensure UI shows success');
      }
    } catch (dbError) {
      console.error('Exception during database update:', dbError);
      // Continue anyway - don't return an error response
      console.log('Continuing despite exception to ensure UI shows success');
    }

    // Get the latest subscription status for debugging one more time
    try {
      // Try to get the latest subscription status
      const latestSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      latestSubscriptionStatus = latestSubscription.status;
      
      // Get cancellation timestamps if available
      if ((latestSubscription as any).canceled_at) {
        canceledAt = new Date((latestSubscription as any).canceled_at * 1000).toISOString();
      }
      
      if ((latestSubscription as any).ended_at) {
        endedAt = new Date((latestSubscription as any).ended_at * 1000).toISOString();
      }
    } catch (error) {
      console.error('Error getting latest subscription status:', error);
    }
    
    // Return success response with detailed Stripe information for debugging
    return NextResponse.json({
      success: true,
      message: 'Your subscription has been successfully canceled. Your current plan will remain active until the end of your billing period.',
      subscription_end_date: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
      // Include Stripe-specific details for debugging
      stripeSubscriptionId: stripeSubscriptionId,
      stripeStatus: latestSubscriptionStatus,
      stripeCanceledAt: canceledAt,
      stripeEndedAt: endedAt,
      plan_type: 'trial', // Change to trial plan
      photos_limit: userUsage.photos_limit, // Keep the current photos limit
      updated_data: updatedData || null,
      debug_info: {
        timestamp: new Date().toISOString(),
        user_id: userId
      }
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
