// Script to update a user's plan_type to 'trial' directly in the database
// Usage: node update-plan-to-trial.js <userId>

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePlanToTrial(userId) {
  if (!userId) {
    console.error('Error: User ID is required');
    process.exit(1);
  }

  console.log(`Attempting to update plan_type to 'trial' for user: ${userId}`);

  try {
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('user_usage')
      .select('id, user_id, plan_type')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      process.exit(1);
    }

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log('Current user data:', user);

    // Update the plan_type to 'trial'
    const { data, error } = await supabase
      .from('user_usage')
      .update({ 
        plan_type: 'trial',
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating plan_type:', error);
      process.exit(1);
    }

    console.log(`Successfully updated plan_type to 'trial' for user: ${userId}`);

    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('user_usage')
      .select('id, user_id, plan_type, subscription_status')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Updated user data:', updatedUser);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Get userId from command line arguments
const userId = process.argv[2];
updatePlanToTrial(userId);
