import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';

// Make sure we have a Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
          // Check if this is a renewal event by examining the current_period_start
          const previousEvent = event.data.previous_attributes as any;
          
          if (previousEvent && previousEvent.current_period_start) {
            // This is a renewal - the billing period has changed
            console.log('Subscription renewal detected - resetting credits');
            await handleSubscriptionRenewal(subscription.customer.toString(), subscription.id);
          } else {
            // Regular update, not a renewal
            await handleSubscriptionUpdated(subscription.customer.toString(), subscription.id);
          }
        }
        break;
      }
      
      // Handle invoice payment succeeded - another way to detect renewals
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        
        // Check if this is a subscription renewal
        if (invoice.billing_reason === 'subscription_cycle' && invoice.customer) {
          // Get the subscription ID from the invoice lines
          const subscriptionId = invoice.lines?.data?.[0]?.subscription;
          
          if (subscriptionId) {
            console.log('Subscription renewal via invoice detected - resetting credits');
            await handleSubscriptionRenewal(invoice.customer.toString(), subscriptionId.toString());
          }
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
    
    // Try to find the user in consolidated_users first
    let userId: string;
    const { data: consolidatedUserData, error: consolidatedUserError } = await supabase
      .from('consolidated_users')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (consolidatedUserError || !consolidatedUserData) {
      // Fall back to users table if it exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (userError || !userData) {
        // Try to find by customer ID in stripe_customers table
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('customer_id', customerId)
          .single();
        
        if (customerError || !customerData) {
          throw new Error(`User not found for email: ${userEmail} or customer ID: ${customerId}`);
        }
        
        userId = customerData.user_id;
      } else {
        userId = userData.id;
      }
    } else {
      userId = consolidatedUserData.user_id;
    }
    
    // Get the subscription plan details
    const subscriptionItems = subscription.items.data;
    if (subscriptionItems.length === 0) {
      throw new Error('No subscription items found');
    }
    
    const priceId = subscriptionItems[0].price.id;
    
    // Determine plan type based on price ID
    let planType = 'standard';
    if (priceId.includes('agency')) {
      planType = 'agency';
    }
    
    // Store subscription information in the database
    // First, check if we have a subscriptions table
    const { error: tableCheckError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    // If the table exists, store the subscription information
    if (!tableCheckError) {
      // Store subscription period information
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          price_id: priceId,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'subscription_id' });
      
      if (subscriptionError) {
        console.error('Error storing subscription information:', subscriptionError);
      } else {
        console.log(`Stored subscription period information for user ${userId}`);
      }
    } else {
      console.log('Subscriptions table does not exist, skipping subscription storage');
      
      // Update the subscription_status in consolidated_users and user_usage
      const { error: consolidatedError } = await supabase
        .from('consolidated_users')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (consolidatedError) {
        console.error('Error updating subscription status in consolidated_users:', consolidatedError);
      }
      
      const { error: usageError } = await supabase
        .from('user_usage')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (usageError) {
        console.error('Error updating subscription status in user_usage:', usageError);
      }
    }
    
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
    console.log(`Processing subscription update ${subscriptionId} for customer ${customerId}`);
    
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
    
    // Find the user in the database
    let userId: string;
    const { data: userData, error: userError } = await supabase
      .from('consolidated_users')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      // Try to find by customer ID in stripe_customers table
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single();
      
      if (customerError || !customerData) {
        throw new Error(`User not found for email: ${userEmail} or customer ID: ${customerId}`);
      }
      
      userId = customerData.user_id;
    } else {
      userId = userData.user_id;
    }
    
    // Get the subscription plan details
    const subscriptionItems = subscription.items.data;
    if (subscriptionItems.length === 0) {
      throw new Error('No subscription items found');
    }
    
    const priceId = subscriptionItems[0].price.id;
    
    // Determine if this is a downgrade by comparing with the current plan
    const { data: currentUsage, error: usageError } = await supabase
      .from('user_usage')
      .select('plan_type, photos_limit, photos_used')
      .eq('user_id', userId)
      .single();
    
    if (usageError) {
      console.error('Error fetching current user usage:', usageError);
      throw new Error(`Failed to fetch current user usage: ${usageError.message}`);
    }
    
    // Determine new plan type and credits
    let newPlanType = 'standard';
    let newPhotosLimit = 50;
    
    if (priceId.includes('agency')) {
      newPlanType = 'agency';
      newPhotosLimit = 300;
    }
    
    // Check if this is a downgrade
    const isDowngrade = 
      (currentUsage.plan_type === 'agency' && newPlanType === 'standard') ||
      (currentUsage.photos_limit > newPhotosLimit);
    
    console.log(`Plan change for user ${userId}: ${currentUsage.plan_type}(${currentUsage.photos_limit}) -> ${newPlanType}(${newPhotosLimit})`);
    console.log(`Is downgrade: ${isDowngrade}`);
    
    // Update subscription information in the database
    const { error: tableCheckError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    // If the subscriptions table exists, update it
    if (!tableCheckError) {
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          price_id: priceId,
          plan_type: newPlanType,
          status: subscription.status,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          // Store the previous plan info for downgrades
          previous_plan_type: isDowngrade ? currentUsage.plan_type : null,
          previous_photos_limit: isDowngrade ? currentUsage.photos_limit : null
        }, { onConflict: 'subscription_id' });
      
      if (subscriptionError) {
        console.error('Error updating subscription information:', subscriptionError);
      }
    }
    
    // If this is a downgrade, preserve the current credits until the end of the billing cycle
    // Otherwise, update the credits immediately
    if (isDowngrade) {
      console.log(`Downgrade detected. Preserving current credits until the end of billing cycle for user ${userId}`);
      
      // Only update the plan_type but keep the current photos_limit
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          plan_type: newPlanType,  // Update the plan type immediately
          // Keep the current photos_limit until the end of the billing cycle
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating user plan type:', updateError);
      }
      
      // Also update consolidated_users table
      const { error: consolidatedError } = await supabase
        .from('consolidated_users')
        .update({
          plan_type: newPlanType,  // Update the plan type immediately
          // Keep the current photos_limit until the end of the billing cycle
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (consolidatedError) {
        console.error('Error updating consolidated user plan type:', consolidatedError);
      }
    } else {
      // For upgrades, update the credits immediately
      console.log(`Upgrade or same tier change. Updating credits immediately for user ${userId}`);
      await updateUserCreditsForPlan(userId, priceId);
    }
    
    console.log(`Successfully processed subscription update ${subscriptionId} for user ${userId}`);
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
    
    // Try to find the user in consolidated_users first
    let userId: string;
    const { data: consolidatedUserData, error: consolidatedUserError } = await supabase
      .from('consolidated_users')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (consolidatedUserError || !consolidatedUserData) {
      // Fall back to users table if it exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (userError || !userData) {
        // Try to find by customer ID in stripe_customers table
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('customer_id', customerId)
          .single();
        
        if (customerError || !customerData) {
          throw new Error(`User not found for email: ${userEmail} or customer ID: ${customerId}`);
        }
        
        userId = customerData.user_id;
      } else {
        userId = userData.id;
      }
    } else {
      userId = consolidatedUserData.user_id;
    }
    
    // Get the latest subscription for this customer to check the end date
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'canceled',
      limit: 1
    });
    
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
      const now = new Date();
      
      // Update subscription status to 'canceled' but keep the plan active until the end of the period
      // First, check if we have a subscriptions table
      const { error: tableCheckError } = await supabase
        .from('subscriptions')
        .select('id')
        .limit(1);
      
      if (!tableCheckError) {
        // Update subscription status in the database
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            subscription_id: subscription.id,
            customer_id: customerId,
            status: 'canceled',
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'subscription_id' });
        
        if (subscriptionError) {
          console.error('Error updating subscription information:', subscriptionError);
        }
      }
      
      // Update the subscription_status in consolidated_users and user_usage
      const { error: consolidatedError } = await supabase
        .from('consolidated_users')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (consolidatedError) {
        console.error('Error updating subscription status in consolidated_users:', consolidatedError);
      }
      
      const { error: usageError } = await supabase
        .from('user_usage')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (usageError) {
        console.error('Error updating subscription status in user_usage:', usageError);
      }
      
      // Only reset to free plan if the subscription period has already ended
      if (now > currentPeriodEnd) {
        console.log(`Subscription period has ended, resetting user ${userId} to free plan`);
        await updateUserToFreePlan(userId);
      } else {
        console.log(`Subscription canceled but still active until ${currentPeriodEnd.toISOString()} for user ${userId}`);
        // Schedule a job to reset the user to free plan after the period ends
        // This would ideally be done with a scheduled function or cron job
        // For now, we'll rely on the user's next login after the period ends
      }
    } else {
      // No active subscription found, reset to free plan immediately
      console.log(`No active subscription found for user ${userId}, resetting to free plan`);
      await updateUserToFreePlan(userId);
    }
    
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

// Handle subscription renewal - reset credits and start a new billing period
async function handleSubscriptionRenewal(customerId: string, subscriptionId: string) {
  try {
    console.log(`Processing subscription renewal ${subscriptionId} for customer ${customerId}`);
    
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
    
    // Find the user in the database by email
    let userId: string;
    const { data: userData, error: userError } = await supabase
      .from('consolidated_users')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      // Try to find by customer ID in stripe_customers table if it exists
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single();
      
      if (customerError || !customerData) {
        throw new Error(`User not found for email: ${userEmail} or customer ID: ${customerId}`);
      }
      
      // Use the user ID from the stripe_customers table
      userId = customerData.user_id;
    } else {
      userId = userData.user_id;
    }
    
    // Get the subscription plan details
    const subscriptionItems = subscription.items.data;
    if (subscriptionItems.length === 0) {
      throw new Error('No subscription items found');
    }
    
    const priceId = subscriptionItems[0].price.id;
    
    // Determine plan type based on price ID
    let planType = 'standard';
    if (priceId.includes('agency')) {
      planType = 'agency';
    }
    
    // Update subscription period information in the database if the subscriptions table exists
    const { error: tableCheckError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    // If the table exists, update the subscription information
    if (!tableCheckError) {
      // Update subscription period information
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          customer_id: customerId,
          price_id: priceId,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'subscription_id' });
      
      if (subscriptionError) {
        console.error('Error updating subscription information:', subscriptionError);
      } else {
        console.log(`Updated subscription period information for user ${userId}`);
      }
    } else {
      console.log('Subscriptions table does not exist, skipping subscription update');
    }
    
    // Reset user credits based on the subscription plan
    await resetUserCreditsForRenewal(userId, priceId);
    
    console.log(`Successfully processed subscription renewal ${subscriptionId} for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription renewal:', error);
  }
}

// Reset user credits for subscription renewal
async function resetUserCreditsForRenewal(userId: string, priceId: string) {
  try {
    console.log(`Resetting credits for user ${userId} at the start of new billing cycle`);
    
    // First, check if this user had a downgrade scheduled
    // If so, we need to apply the new lower limit now
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('previous_plan_type, previous_photos_limit, plan_type, price_id')
      .eq('user_id', userId)
      .single();
    
    // Determine plan type and credits based on price ID
    let planType = 'standard';
    let photosLimit = 50;
    
    if (priceId.includes('agency')) {
      planType = 'agency';
      photosLimit = 300;
    }
    
    // Check if there was a previous downgrade that needs to be applied
    if (!subscriptionError && subscriptionData && subscriptionData.previous_photos_limit) {
      console.log(`Found previous downgrade for user ${userId}. Applying new lower limit.`);
      console.log(`Previous plan: ${subscriptionData.previous_plan_type}, Previous limit: ${subscriptionData.previous_photos_limit}`);
      console.log(`New plan: ${planType}, New limit: ${photosLimit}`);
      
      // Clear the previous plan info since we're applying it now
      const { error: clearPreviousError } = await supabase
        .from('subscriptions')
        .update({
          previous_plan_type: null,
          previous_photos_limit: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (clearPreviousError) {
        console.error('Error clearing previous plan info:', clearPreviousError);
      }
    } else {
      console.log(`No previous downgrade found for user ${userId}. Applying standard renewal.`);
    }
    
    console.log(`Setting credits for user ${userId} to ${photosLimit} for plan ${planType}`);
    
    // ALWAYS reset photos_used to 0 and set photos_limit to the current plan limit
    // This ensures credits don't roll over between billing cycles
    const { error: usageError } = await supabase
      .from('user_usage')
      .update({
        photos_used: 0,  // Reset used credits to 0
        photos_limit: photosLimit,  // Set limit based on current plan
        plan_type: planType,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (usageError) {
      throw new Error(`Failed to reset user credits: ${usageError.message}`);
    }
    
    // Also update consolidated_users table
    const { error: consolidatedError } = await supabase
      .from('consolidated_users')
      .update({
        photos_used: 0,  // Reset used credits to 0
        photos_limit: photosLimit,  // Set limit based on current plan
        plan_type: planType,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (consolidatedError) {
      console.error(`Error updating consolidated_users: ${consolidatedError.message}`);
    }
    
    console.log(`Successfully reset credits for user ${userId}`);
  } catch (error) {
    console.error('Error resetting user credits for renewal:', error);
  }
}
