// Direct script to update subscription status and credits
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Your user ID (hardcoded for simplicity)
const userId = 'e745a66a-5743-4112-a611-23edc9bd1d6f';
const planType = 'standard';
const creditsToGrant = 50;

async function updateSubscription() {
  console.log(`Directly updating subscription for user ${userId}`);

  try {
    // 1. Update user_usage table
    console.log('Updating user_usage table...');
    
    // First check if the record exists
    const { data: existingUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (existingUsage) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          subscription_status: 'active',
          plan_type: planType,
          credits_remaining: creditsToGrant,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating user_usage:', updateError.message);
      } else {
        console.log('Successfully updated user_usage record');
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_usage')
        .insert([{
          user_id: userId,
          subscription_status: 'active',
          plan_type: planType,
          credits_remaining: creditsToGrant,
          credits_used: 0,
          last_updated: new Date().toISOString()
        }]);
        
      if (insertError) {
        console.error('Error inserting user_usage:', insertError.message);
      } else {
        console.log('Successfully created user_usage record');
      }
    }
    
    // 2. Update consolidated_users table
    console.log('Updating consolidated_users table...');
    
    const { error: consolidatedError } = await supabase
      .from('consolidated_users')
      .update({
        subscription_status: 'active'
      })
      .eq('user_id', userId);
      
    if (consolidatedError) {
      console.error('Error updating consolidated_users:', consolidatedError.message);
    } else {
      console.log('Successfully updated consolidated_users record');
    }
    
    // 3. Verify the updates
    console.log('Verifying updates...');
    
    const { data: updatedUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    console.log('Updated user_usage record:', updatedUsage);
    
    const { data: updatedUser } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    console.log('Updated consolidated_users record:', updatedUser);
    
    console.log('Subscription update process completed');
  } catch (error) {
    console.error('Error in update process:', error.message);
  }
}

updateSubscription();
