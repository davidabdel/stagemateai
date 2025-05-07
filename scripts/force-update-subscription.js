// Script to force-update a user's subscription status and credits
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

// Get command line arguments
const userId = process.argv[2];
const planType = process.argv[3] || 'standard'; // Default to standard plan if not specified

if (!userId) {
  console.error('Usage: node force-update-subscription.js <userId> [planType]');
  console.error('planType can be "standard" or "agency", defaults to "standard"');
  process.exit(1);
}

// Credits to grant based on plan type
const creditsToGrant = planType === 'agency' ? 300 : 50;

async function updateSubscription() {
  console.log(`Updating subscription for user ${userId} to ${planType} plan with ${creditsToGrant} credits`);

  try {
    // Check if user exists in user_usage table
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (usageError && !usageError.message.includes('does not exist')) {
      console.error('Error checking user_usage:', usageError);
      return;
    }

    // Generate a fake subscription ID if needed
    const subscriptionId = `sub_force_${Date.now()}`;
    
    if (usageData) {
      // Update existing user usage record
      console.log('Updating existing user_usage record');
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
        console.error('Error updating user_usage:', updateError);
      } else {
        console.log('Successfully updated user_usage');
      }
    } else {
      // Create new user usage record
      console.log('Creating new user_usage record');
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
        console.error('Error inserting user_usage:', insertError);
      } else {
        console.log('Successfully created user_usage record');
      }
    }

    // Check if user exists in consolidated_users table
    const { data: consolidatedData, error: consolidatedCheckError } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (consolidatedCheckError && !consolidatedCheckError.message.includes('does not exist')) {
      console.error('Error checking consolidated_users:', consolidatedCheckError);
    }

    if (consolidatedData) {
      // Update existing consolidated_users record
      console.log('Updating existing consolidated_users record');
      const { error: consolidatedUpdateError } = await supabase
        .from('consolidated_users')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (consolidatedUpdateError) {
        console.error('Error updating consolidated_users:', consolidatedUpdateError);
      } else {
        console.log('Successfully updated consolidated_users');
      }
    }

    console.log('Subscription update complete!');
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

updateSubscription();
