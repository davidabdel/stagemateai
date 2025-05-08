import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching Stripe customer data for user: ${userId}`);
    
    // Get the customer data from the stripe_customers table
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (customerError) {
      console.error('Error fetching Stripe customer data:', customerError);
      return NextResponse.json(
        { error: 'Failed to fetch Stripe customer data' },
        { status: 500 }
      );
    }
    
    // Return the customer data
    return NextResponse.json(customerData);
    
  } catch (error) {
    console.error('Error in get-stripe-customer API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe customer data' },
      { status: 500 }
    );
  }
}
