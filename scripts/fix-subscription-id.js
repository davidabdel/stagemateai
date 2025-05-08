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

async function fixSubscriptionIds() {
  console.log('Starting to fix subscription IDs...');
  
  try {
    // Find all records with [object Object] as subscription_id
    const { data: customers, error: customerError } = await supabase
      .from('stripe_customers')
      .select('*')
      .eq('subscription_id', '[object Object]');
    
    if (customerError) {
      console.error('Error fetching customers:', customerError);
      return;
    }
    
    console.log(`Found ${customers.length} customers with invalid subscription IDs`);
    
    // Update each record to set subscription_id to null
    for (const customer of customers) {
      console.log(`Fixing customer ${customer.customer_id} for user ${customer.user_id}`);
      
      const { error: updateError } = await supabase
        .from('stripe_customers')
        .update({ subscription_id: null })
        .eq('id', customer.id);
      
      if (updateError) {
        console.error(`Error updating subscription ID for customer ${customer.customer_id}:`, updateError);
      } else {
        console.log(`Reset subscription ID for customer ${customer.customer_id}`);
      }
    }
    
    console.log('Finished fixing subscription IDs');
  } catch (error) {
    console.error('Error in fix process:', error);
  }
}

fixSubscriptionIds()
  .catch(err => {
    console.error('Error in script:', err);
  })
  .finally(() => {
    console.log('Script completed');
  });
