import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    console.log('Received direct checkout request');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { priceId, productId, interval = 'month', userId } = body as { priceId?: string; productId?: string; interval?: 'month' | 'year'; userId?: string };

    let resolvedPriceId = priceId as string | undefined;

    // Allow resolving by productId for monthly/yearly selections
    if (!resolvedPriceId && productId) {
      console.log(`Resolving price for product ${productId} with interval ${interval}`);
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 100,
      });
      const recurringPrices = prices.data.filter(p => p.recurring && p.recurring.interval === interval);
      if (recurringPrices.length === 0) {
        console.error('No recurring prices found for product/interval', { productId, interval });
        return NextResponse.json({ error: `No active ${interval} price found for product` }, { status: 400 });
      }
      // Choose the first active price (you can sort by created if multiple)
      resolvedPriceId = recurringPrices.sort((a,b) => (a.created || 0) - (b.created || 0)).pop()!.id;
      console.log('Resolved price ID:', resolvedPriceId);
    }

    if (!resolvedPriceId) {
      console.error('Missing priceId or resolvable productId in request');
      return NextResponse.json({ error: 'Missing priceId or productId' }, { status: 400 });
    }
    
    console.log(`Creating direct checkout session for price ${resolvedPriceId}`);
    console.log('User ID from request:', userId);
    
    // Store the userId in the client_reference_id for later use
    const clientReferenceId = userId || '';
    console.log('Using client_reference_id:', clientReferenceId);
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      client_reference_id: clientReferenceId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      // Let Stripe collect the email during checkout
      billing_address_collection: 'auto',
      success_url: `${req.nextUrl.origin}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/dashboard/upgrade?canceled=true`,
    });
    
    console.log('Created checkout session:', session.id);
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
