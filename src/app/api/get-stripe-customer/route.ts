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
    
    // Process the customer data to handle JSON strings
    let processedData = { ...customerData };
    
    // Check if customer_id is a JSON string and extract the ID
    if (processedData.customer_id && typeof processedData.customer_id === 'string') {
      try {
        // Try to parse it as JSON
        const customerObj = JSON.parse(processedData.customer_id);
        if (customerObj && customerObj.id) {
          console.log(`Extracted customer ID ${customerObj.id} from JSON string`);
          processedData.customer_id = customerObj.id;
        }
      } catch (e) {
        // If it's not valid JSON, keep it as is
        console.log('Customer ID is not a JSON string, using as is');
      }
    }
    
    // Return the processed data
    return NextResponse.json(processedData);
    
  } catch (error) {
    console.error('Error in get-stripe-customer API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe customer data' },
      { status: 500 }
    );
  }
}
