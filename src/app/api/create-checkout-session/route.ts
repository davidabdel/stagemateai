import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Get the authenticated user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user email from Clerk
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData || !userData.email) {
      console.error('Error fetching user email:', userError);
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    console.log('Creating checkout session with priceId:', priceId, 'for user:', userId);

    // Check if customer already exists for this user
    let customerId: string | null = null;
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .single();

    if (customerData && customerData.customer_id) {
      customerId = customerData.customer_id;
      console.log('Found existing Stripe customer:', customerId);
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;
      console.log('Created new Stripe customer:', customerId);

      // Save the customer ID in the database
      await supabase
        .from('stripe_customers')
        .insert([{
          user_id: userId,
          customer_id: customerId,
          email: userData.email
        }]);
    }

    // Create the checkout session with proper params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${req.nextUrl.origin}/dashboard/upgrade?canceled=true`,
    };
    
    // Add customer ID if available
    if (customerId) {
      sessionParams.customer = customerId;
    }
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
