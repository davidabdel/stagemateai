import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId } = await request.json();

    if (!userId) {
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

    // Get the customer ID from Stripe customers using the user's ID or email
    let stripeCustomerId;
    let stripeSubscriptionId;
    
    try {
      // First try to find the customer by metadata.user_id
      const customers = await stripe.customers.list({
        limit: 1,
        expand: ['data.subscriptions']
      });
      
      // Filter customers with the matching user_id in metadata
      const matchingCustomers = customers.data.filter(customer => 
        customer.metadata && customer.metadata.user_id === userId
      );
      
      if (matchingCustomers.length > 0) {
        stripeCustomerId = matchingCustomers[0].id;
        
        // Get the customer's active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          stripeSubscriptionId = subscriptions.data[0].id;
        }
      }
    } catch (error) {
      console.error('Error finding Stripe customer:', error);
    }
    
    if (!stripeSubscriptionId) {
      // For testing purposes, allow downgrading without a Stripe subscription
      console.log('No Stripe subscription found, but proceeding with plan downgrade');
      
      // Update the user's plan to trial in the database
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({ 
          plan_type: 'trial',
          photos_limit: 3,  // Reset to trial plan limits
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error downgrading user plan:', updateError);
        return NextResponse.json(
          { error: 'Failed to downgrade subscription' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Your plan has been downgraded to the trial plan',
        test_mode: true
      });
    }
    
    // If we found a Stripe subscription, cancel it
    const subscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    
    // Update the user's plan status in the database
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({ 
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
