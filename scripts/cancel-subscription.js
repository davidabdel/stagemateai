// Script to cancel a subscription in Stripe and update the plan_type to 'trial' in Supabase
// Usage: node cancel-subscription.js <userId> [<subscriptionId>]

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Stripe client
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

if (!stripeKey) {
  console.error('Error: Stripe secret key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cancelSubscription(userId, subscriptionId = null) {
  if (!userId) {
    console.error('Error: User ID is required');
    process.exit(1);
  }

  console.log(`Attempting to cancel subscription for user: ${userId}`);

  try {
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('user_usage')
      .select('id, user_id, plan_type, subscription_status')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      process.exit(1);
    }

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log('Current user data:', user);

    // If no subscription ID is provided, try to find it from Stripe
    if (!subscriptionId) {
      console.log('No subscription ID provided, searching for active subscriptions in Stripe...');
      
      // Get all customers and filter by metadata
      const customers = await stripe.customers.list({
        limit: 100,
        expand: ['data.subscriptions']
      });
      
      // Filter customers with the matching user_id in metadata
      const matchingCustomers = customers.data.filter(customer => 
        customer.metadata && customer.metadata.user_id === userId
      );
      
      if (matchingCustomers.length > 0) {
        const stripeCustomerId = matchingCustomers[0].id;
        console.log(`Found customer ID: ${stripeCustomerId}`);
        
        // Get the customer's active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          subscriptionId = subscriptions.data[0].id;
          console.log(`Found active subscription: ${subscriptionId}`);
        } else {
          console.log('No active subscriptions found for this user');
        }
      } else {
        console.log('No matching customer found in Stripe');
      }
    }

    // If we found a subscription ID, cancel it in Stripe
    if (subscriptionId) {
      try {
        console.log(`Canceling subscription ${subscriptionId} in Stripe...`);
        
        // Cancel the subscription immediately
        const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId, {
          invoice_now: true, // Generate a final invoice for any usage or proration
          prorate: true      // Prorate the unused portion
        });
        
        console.log('Subscription canceled successfully:', canceledSubscription.status);
        console.log('Canceled at:', new Date(canceledSubscription.canceled_at * 1000).toISOString());
      } catch (stripeError) {
        console.error('Error canceling subscription in Stripe:', stripeError.message);
      }
    }

    // Update the user's plan type to 'trial' in Supabase
    console.log(`Updating plan_type to 'trial' for user ${userId} in Supabase...`);
    
    // First, directly update the plan_type
    const { error: planUpdateError } = await supabase
      .from('user_usage')
      .update({ plan_type: 'trial' })
      .eq('user_id', userId);
    
    if (planUpdateError) {
      console.error('Error updating plan_type:', planUpdateError);
    } else {
      console.log('Successfully updated plan_type to trial');
    }
    
    // Then update the subscription status
    const { error: statusUpdateError } = await supabase
      .from('user_usage')
      .update({ 
        subscription_status: 'canceled',
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (statusUpdateError) {
      console.error('Error updating subscription status:', statusUpdateError);
    } else {
      console.log('Successfully updated subscription status to canceled');
    }

    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('user_usage')
      .select('id, user_id, plan_type, subscription_status, cancellation_date')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Updated user data:', updatedUser);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Get userId and optional subscriptionId from command line arguments
const userId = process.argv[2];
const subscriptionId = process.argv[3];
cancelSubscription(userId, subscriptionId);
