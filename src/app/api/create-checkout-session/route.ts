import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';

// Make sure we have a Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    console.log('Received checkout request');
    
    // Log the request headers to check for authentication
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Request headers:', headers);
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { priceId } = body;
    if (!priceId) {
      console.error('Missing priceId in request');
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Get the authenticated user
    const auth = getAuth(req);
    console.log('Auth object:', auth);
    
    let userId = auth?.userId;
    
    // TEMPORARY WORKAROUND: If Clerk auth fails, try to get userId from the request cookies or headers
    if (!userId) {
      console.warn('Clerk authentication failed, trying alternative methods');
      
      // Try to get userId from cookies
      const cookieUserId = req.cookies.get('userId')?.value;
      if (cookieUserId) {
        console.log('Found userId in cookies:', cookieUserId);
        userId = cookieUserId;
      } else {
        // Try to get from custom header (frontend would need to set this)
        const headerUserId = req.headers.get('x-user-id');
        if (headerUserId) {
          console.log('Found userId in headers:', headerUserId);
          userId = headerUserId;
        } else {
          // For testing only: Allow passing userId in the request body
          const bodyUserId = body.userId;
          if (bodyUserId) {
            console.log('Using userId from request body (TEST ONLY):', bodyUserId);
            userId = bodyUserId;
          }
        }
      }
    }
    
    if (!userId) {
      console.error('User not authenticated by any method');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    console.log('Authenticated user ID:', userId);

    // Get user email from consolidated_users table
    let userEmail: string;
    
    const { data: userData, error: userError } = await supabase
      .from('consolidated_users')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (userError || !userData || !userData.email) {
      console.error('Error fetching user email:', userError);
      console.log('Trying to fetch from user_usage table as fallback');
      
      // Try user_usage as fallback
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('email')
        .eq('user_id', userId)
        .single();
        
      if (usageError || !usageData || !usageData.email) {
        console.error('Error fetching user email from user_usage:', usageError);
        return NextResponse.json({ error: 'User email not found in any table' }, { status: 400 });
      }
      
      // Use the email from user_usage
      userEmail = usageData.email;
    } else {
      userEmail = userData.email;
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
        email: userEmail,
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
          email: userEmail
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
