import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

// Webhook secret for verifying the event
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !endpointSecret) {
      console.error('Missing signature or endpoint secret');
      return NextResponse.json({ error: 'Missing signature or endpoint secret' }, { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    console.log(`Event type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // Process the subscription
        if (session.mode === 'subscription' && session.customer && session.subscription) {
          await handleSubscriptionCreated(session.customer.toString(), session.subscription.toString());
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}:`, subscription.id);
        
        if (subscription.customer) {
          await handleSubscriptionUpdated(subscription.customer.toString(), subscription.id);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);
        
        if (subscription.customer) {
          await handleSubscriptionCancelled(subscription.customer.toString());
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle subscription created
async function handleSubscriptionCreated(customerId: string, subscriptionId: string) {
  try {
    console.log(`Processing new subscription ${subscriptionId} for customer ${customerId}`);
    
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get customer details to find the user
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      throw new Error('Customer not found or deleted');
    }
    
    // Get the user ID from the customer metadata or email
    const userEmail = typeof customer === 'object' ? customer.email : null;
    
    if (!userEmail) {
      throw new Error('Cannot identify user from Stripe customer');
    }
    
    // Find the user in Supabase by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      throw new Error(`User not found for email: ${userEmail}`);
    }
    
    const userId = userData.id;
    
    // Get the subscription plan details
    const subscriptionItems = subscription.items.data;
    if (subscriptionItems.length === 0) {
      throw new Error('No subscription items found');
    }
    
    const priceId = subscriptionItems[0].price.id;
    
    // Update user credits based on the subscription plan
    await updateUserCreditsForPlan(userId, priceId);
    
    console.log(`Successfully processed subscription ${subscriptionId} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(customerId: string, subscriptionId: string) {
  try {
    // Similar to handleSubscriptionCreated
    await handleSubscriptionCreated(customerId, subscriptionId);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(customerId: string) {
  try {
    console.log(`Processing subscription cancellation for customer ${customerId}`);
    
    // Get customer details to find the user
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      throw new Error('Customer not found or deleted');
    }
    
    // Get the user ID from the customer metadata or email
    const userEmail = typeof customer === 'object' ? customer.email : null;
    
    if (!userEmail) {
      throw new Error('Cannot identify user from Stripe customer');
    }
    
    // Find the user in Supabase by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      throw new Error(`User not found for email: ${userEmail}`);
    }
    
    const userId = userData.id;
    
    // Reset user to free plan
    await updateUserToFreePlan(userId);
    
    console.log(`Successfully processed subscription cancellation for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}

// Update user credits based on the subscription plan
async function updateUserCreditsForPlan(userId: string, priceId: string) {
  try {
    // Get the plan details from the subscription_plans table
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();
    
    if (planError || !planData) {
      throw new Error(`Plan not found for price ID: ${priceId}`);
    }
    
    // Update user credits
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({
        photos_limit: planData.credits,
        plan_type: planData.name.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update user credits: ${updateError.message}`);
    }
    
    console.log(`Updated user ${userId} to plan ${planData.name} with ${planData.credits} credits`);
  } catch (error) {
    console.error('Error updating user credits for plan:', error);
  }
}

// Reset user to free plan
async function updateUserToFreePlan(userId: string) {
  try {
    // Update user to free plan with 3 credits
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({
        photos_limit: 3,
        plan_type: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update user to free plan: ${updateError.message}`);
    }
    
    console.log(`Reset user ${userId} to free plan`);
  } catch (error) {
    console.error('Error updating user to free plan:', error);
  }
}
