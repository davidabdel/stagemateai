require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// User ID to check
const userId = 'e745a66a-5743-4112-a611-23edc9bd1d6f'; // David's user ID

async function checkSubscriptions() {
  console.log(`Checking subscription data for user: ${userId}`);
  
  // Check user_usage table
  const { data: userUsage, error: usageError } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (usageError) {
    console.error('Error fetching user usage:', usageError);
  } else {
    console.log('User usage data:');
    console.log(JSON.stringify(userUsage, null, 2));
  }
  
  // Check stripe_customers table
  const { data: customerData, error: customerError } = await supabase
    .from('stripe_customers')
    .select('*')
    .eq('user_id', userId);
  
  if (customerError) {
    console.error('Error fetching Stripe customer data:', customerError);
  } else {
    console.log('\nStripe customer data:');
    console.log(JSON.stringify(customerData, null, 2));
    
    // If we have a customer ID, check for subscriptions
    if (customerData && customerData.length > 0) {
      const customerId = customerData[0].customer_id;
      console.log(`\nFound Stripe customer ID: ${customerId}`);
      
      // Check subscriptions table
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);
      
      if (subscriptionError) {
        console.error('Error fetching subscriptions:', subscriptionError);
      } else {
        console.log('\nSubscriptions data:');
        console.log(JSON.stringify(subscriptions, null, 2));
      }
    }
  }
}

checkSubscriptions()
  .catch(err => {
    console.error('Error in script:', err);
  })
  .finally(() => {
    process.exit(0);
  });
