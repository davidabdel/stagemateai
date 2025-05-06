import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';

// Make sure we have a Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Webhook secret for verifying the event
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Map of price IDs to plan types and credits
const PRICE_TO_PLAN_MAP: Record<string, { type: string, name: string, credits: number }> = {
  'price_1RJvUsERoniVImA52TcIJy5c': { type: 'agency', name: 'Agency Plan', credits: 300 },
  'price_1OqXXXXXXXXXXXXXXXXXXXXX': { type: 'standard', name: 'Standard Plan', credits: 100 },
};

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
        console.log('Full session data:', JSON.stringify(session, null, 2));
        
        // Get the user ID from the client_reference_id
        if (session.client_reference_id) {
          console.log('Found client_reference_id:', session.client_reference_id);
          await processCompletedCheckout(session);
        } else if (session.customer && session.subscription) {
          // Fallback to subscription handling
          console.log('No client_reference_id, using customer ID:', session.customer);
          await handleSubscriptionCreated(session.customer.toString(), session.subscription.toString());
        } else {
          console.error('Cannot identify user from session');
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

// Process a completed checkout session
async function processCompletedCheckout(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout session:', session.id);
    
    // Get the user ID from the client_reference_id
    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error('No client_reference_id found in session');
    }
    
    console.log('Updating user plan for userId:', userId);
    
    // Get the line items to determine the plan
    let planType = 'standard';
    let creditsToAdd = 100;
    let planName = 'Standard Plan';
    
    if (session.line_items) {
      // If line_items is available directly
      console.log('Line items available in session');
      processLineItems(session.line_items.data, userId);
    } else {
      // Need to retrieve line items
      console.log('Retrieving line items for session');
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      await processLineItems(lineItems.data, userId);
    }
    
    console.log('Successfully processed checkout session for user', userId);
  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}

// Process line items to determine plan and update user
async function processLineItems(lineItems: Stripe.LineItem[], userId: string) {
  try {
    if (!lineItems || lineItems.length === 0) {
      throw new Error('No line items found');
    }
    
    // Get the price ID from the first line item
    const priceId = lineItems[0].price?.id;
    if (!priceId) {
      throw new Error('No price ID found in line item');
    }
    
    console.log('Found price ID:', priceId);
    
    // Determine plan type and credits from price ID
    let planType = 'standard';
    let creditsToAdd = 100;
    
    if (PRICE_TO_PLAN_MAP[priceId]) {
      planType = PRICE_TO_PLAN_MAP[priceId].type;
      creditsToAdd = PRICE_TO_PLAN_MAP[priceId].credits;
      console.log(`Using plan ${planType} with ${creditsToAdd} credits from price map`);
    } else {
      console.log(`Price ID ${priceId} not found in map, using default values`);
    }
    
    // First, get current user data
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 is the "not found" error, which we can handle by creating a new record
      throw new Error(`Error fetching user data: ${userError.message}`);
    }
    
    // Calculate new credits - add to existing credits rather than replacing
    const currentCredits = userData?.photos_limit || 0;
    const newCredits = currentCredits + creditsToAdd;
    
    console.log('Updating user credits:', {
      userId,
      currentCredits,
      creditsToAdd,
      newCredits,
      planType
    });
    
    // Update user_usage table using upsert
    const { data: updatedData, error: updateError } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        photos_limit: newCredits,
        photos_used: userData?.photos_used || 0,
        plan_type: planType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (updateError) {
      throw new Error(`Error updating user_usage: ${updateError.message}`);
    }
    
    console.log('Successfully updated user_usage table');
    
    // Also update consolidated_users table
    const { data: consolidatedUser, error: findError } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (consolidatedUser) {
      // Update existing record
      const { error } = await supabase
        .from('consolidated_users')
        .update({
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating consolidated_users:', error);
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('consolidated_users')
        .insert({
          user_id: userId,
          email: 'user@example.com', // Fallback email
          plan_type: planType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error inserting into consolidated_users:', error);
      }
    }
    
    console.log('Successfully processed line items and updated user plan');
  } catch (error) {
    console.error('Error processing line items:', error);
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
