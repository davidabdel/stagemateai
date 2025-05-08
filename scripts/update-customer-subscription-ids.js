require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('Missing Stripe secret key in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

async function updateCustomerSubscriptionIds() {
  console.log('Starting to update customer subscription IDs...');
  
  try {
    // Get all customers from the stripe_customers table
    const { data: customers, error: customerError } = await supabase
      .from('stripe_customers')
      .select('*');
    
    if (customerError) {
      console.error('Error fetching customers:', customerError);
      return;
    }
    
    console.log(`Found ${customers.length} customers in the database`);
    
    // Process each customer
    for (const customer of customers) {
      if (!customer.customer_id) {
        console.log(`Skipping customer with user_id ${customer.user_id} - no customer_id`);
        continue;
      }
      
      console.log(`Processing customer ${customer.customer_id} for user ${customer.user_id}`);
      
      try {
        // Get subscriptions for this customer from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.customer_id,
          limit: 5
        });
        
        if (subscriptions.data.length > 0) {
          // Sort by created date to get the most recent one
          subscriptions.data.sort((a, b) => b.created - a.created);
          
          // Get the most recent subscription
          const latestSubscription = subscriptions.data[0];
          
          console.log(`Found subscription ${latestSubscription.id} (status: ${latestSubscription.status}) for customer ${customer.customer_id}`);
          
          // Update the customer record with the subscription ID
          const { error: updateError } = await supabase
            .from('stripe_customers')
            .update({ subscription_id: latestSubscription.id })
            .eq('customer_id', customer.customer_id);
          
          if (updateError) {
            console.error(`Error updating subscription ID for customer ${customer.customer_id}:`, updateError);
          } else {
            console.log(`Updated subscription ID for customer ${customer.customer_id} to ${latestSubscription.id}`);
          }
        } else {
          console.log(`No subscriptions found for customer ${customer.customer_id}`);
        }
      } catch (stripeError) {
        console.error(`Error fetching subscriptions for customer ${customer.customer_id}:`, stripeError);
      }
    }
    
    console.log('Finished updating customer subscription IDs');
  } catch (error) {
    console.error('Error in update process:', error);
  }
}

updateCustomerSubscriptionIds()
  .catch(err => {
    console.error('Error in script:', err);
  })
  .finally(() => {
    process.exit(0);
  });
