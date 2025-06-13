// Script to fix subscription by updating the correct fields in the database
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
const photosLimit = 50; // Standard plan limit

async function fixSubscription() {
  console.log(`Fixing subscription for user ${userId}`);

  try {
    // First, let's check the actual schema of the user_usage table
    console.log('Checking user_usage table schema...');
    const { data: usageData } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('Current user_usage record:', usageData);
    
    // Update user_usage table with the correct fields
    console.log('Updating user_usage table...');
    const { error: usageError } = await supabase
      .from('user_usage')
      .update({
        plan_type: 'standard', // Update to standard plan
        photos_limit: photosLimit // Update photos limit
      })
      .eq('user_id', userId);
    
    if (usageError) {
      console.error('Error updating user_usage:', usageError.message);
    } else {
      console.log('Successfully updated user_usage table');
    }
    
    // Now check and update the consolidated_users table
    console.log('Checking consolidated_users table schema...');
    const { data: userData } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('Current consolidated_users record:', userData);
    
    // Update consolidated_users table with the correct fields
    console.log('Updating consolidated_users table...');
    const { error: userError } = await supabase
      .from('consolidated_users')
      .update({
        plan_type: 'standard', // Update to standard plan
        photos_limit: photosLimit, // Update photos limit
        credits_remaining: 49 // Reset credits to 49 (50 minus the 1 already used)
      })
      .eq('user_id', userId);
    
    if (userError) {
      console.error('Error updating consolidated_users:', userError.message);
    } else {
      console.log('Successfully updated consolidated_users table');
    }
    
    // Verify the updates
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
    
    console.log('Subscription fix completed');
  } catch (error) {
    console.error('Error in fix process:', error.message);
  }
}

fixSubscription();
