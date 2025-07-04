import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil' as any,
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching subscription status for user: ${userId}`);
    
    // Get user details from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }
    
    // Try to find the Stripe customer ID
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .single();
    
    // Define the type for subscription items
    interface SubscriptionItem {
      price_id: string;
      quantity: number | null;
    }

    // Define the type for stripe subscriptions
    interface StripeSubscriptionInfo {
      id: string;
      status: string;
      current_period_end: string;
      canceled_at: string | null;
      cancel_at_period_end: boolean;
      items: SubscriptionItem[];
    }

    let stripeSubscriptions: StripeSubscriptionInfo[] = [];
    let stripeCustomerId = null;
    
    if (!customerError && customerData) {
      stripeCustomerId = customerData.customer_id;
      
      // Get all subscriptions for this customer from Stripe
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 5,
          expand: ['data.default_payment_method']
        });
        
        // Process each subscription with proper type handling
        stripeSubscriptions = subscriptions.data.map(sub => {
          // Safely access properties with type assertions
          const subObj = sub as any; // Use any for accessing properties TypeScript doesn't recognize
          
          return {
            id: sub.id,
            status: sub.status,
            current_period_end: new Date(subObj.current_period_end * 1000).toISOString(),
            canceled_at: subObj.canceled_at ? new Date(subObj.canceled_at * 1000).toISOString() : null,
            cancel_at_period_end: sub.cancel_at_period_end,
            items: sub.items.data.map(item => ({
              price_id: item.price.id,
              quantity: item.quantity || null
            }))
          };
        });
      } catch (stripeError) {
        console.error('Error fetching Stripe subscriptions:', stripeError);
      }
    }
    
    // Get subscription data from Supabase
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Find the active subscription ID for easier access in the frontend
    let stripeSubscriptionId = null;
    
    // First look for active subscriptions
    const activeSubscription = stripeSubscriptions.find(sub => sub.status === 'active');
    if (activeSubscription) {
      stripeSubscriptionId = activeSubscription.id;
    } else if (stripeSubscriptions.length > 0) {
      // If no active subscription, use the most recent one
      stripeSubscriptionId = stripeSubscriptions[0].id;
    }
    
    return NextResponse.json({
      user: userData,
      stripeCustomerId,
      stripeSubscriptionId, // Add this field for easier access
      stripeSubscriptions,
      databaseSubscriptions: subscriptionError ? [] : subscriptionData
    });
    
  } catch (error) {
    console.error('Error in subscription-status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
