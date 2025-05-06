import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Map of price IDs to plan types
const PRICE_TO_PLAN_MAP: Record<string, { type: string, name: string }> = {
  // Add your actual price IDs here
  'price_1RJvUsERoniVImA52TcIJy5c': { type: 'agency', name: 'Agency Plan' },
  'price_1OqXXXXXXXXXXXXXXXXXXXXX': { type: 'standard', name: 'Standard Plan' },
  'price_2OqXXXXXXXXXXXXXXXXXXXXX': { type: 'agency', name: 'Agency Plan' },
};

export async function POST(req: NextRequest) {
  try {
    console.log('Received payment verification request');
    
    const body = await req.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      console.error('Missing sessionId in request');
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }
    
    console.log('Retrieving checkout session:', sessionId);
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription', 'line_items.data.price.product']
    });
    
    if (!session) {
      console.error('Session not found:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    console.log('Session details:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      client_reference_id: session.client_reference_id,
      customer: session.customer,
      line_items: session.line_items?.data.map(item => ({
        price_id: item.price?.id,
        product_id: typeof item.price?.product === 'string' ? item.price?.product : item.price?.product?.id
      }))
    });
    
    // Check if the payment was successful
    // For test sessions, we'll accept any status
    const isTestSession = sessionId.startsWith('cs_test_');
    
    if (!isTestSession && session.payment_status !== 'paid') {
      console.error('Payment not completed:', session.payment_status);
      return NextResponse.json({ 
        success: false,
        error: 'Payment not completed',
        status: session.payment_status
      });
    }
    
    // Get the purchased plan details
    let planType = 'standard';
    let planName = 'Standard Plan';
    
    if (session.line_items?.data[0]?.price?.id) {
      const priceId = session.line_items.data[0].price.id;
      
      // Check our price map
      if (PRICE_TO_PLAN_MAP[priceId]) {
        planType = PRICE_TO_PLAN_MAP[priceId].type;
        planName = PRICE_TO_PLAN_MAP[priceId].name;
      } else {
        // Try to get the name from the product
        try {
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product']
          });
          
          if (price.product && typeof price.product !== 'string' && 'name' in price.product) {
            planName = price.product.name || planName;
            
            // Infer plan type from name
            if (planName.toLowerCase().includes('agency')) {
              planType = 'agency';
            }
          }
        } catch (priceError) {
          console.error('Error retrieving price details:', priceError);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      status: session.status,
      paymentStatus: session.payment_status,
      customerId: session.customer,
      subscriptionId: session.subscription,
      amount: session.amount_total,
      planType,
      planName,
      userId: session.client_reference_id // Include the user ID from the client_reference_id
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
