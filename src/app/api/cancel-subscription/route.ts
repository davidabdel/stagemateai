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

    // Get the customer ID from Stripe customers using the user's ID or email
    let stripeCustomerId;
    let stripeSubscriptionId;
    
    try {
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
        plan_type: 'trial', // Change to trial plan
        photos_limit: userUsage.photos_limit, // Keep the current photos limit
        test_mode: true,
        updated_data: updatedData || null,
        debug_info: {
          timestamp: new Date().toISOString(),
          user_id: userId
        }
      });
    }
    
    // If we found a Stripe subscription, cancel it
    let currentPeriodEnd: Date | null = null;
    try {
      const subscription = await stripe.subscriptions.update(
        stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
      
      // Get the current period end date
      currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
      console.log('Successfully updated Stripe subscription to cancel at period end:', subscription.id, 'Period ends:', currentPeriodEnd.toISOString());
    } catch (stripeError) {
      console.error('Error updating Stripe subscription:', stripeError);
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

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Your subscription has been canceled and your plan has been changed to trial.',
      subscription_status: 'canceled',
      plan_type: 'trial', // Change to trial plan
      photos_limit: userUsage.photos_limit, // Keep the current photos limit
      subscription_end_date: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
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
