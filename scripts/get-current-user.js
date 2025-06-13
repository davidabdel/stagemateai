// Script to get the current authenticated user from Supabase
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

async function listUsers() {
  try {
    // List all users in the consolidated_users table
    const { data: users, error } = await supabase
      .from('consolidated_users')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log('Users in consolidated_users table:');
    users.forEach(user => {
      console.log(`User ID: ${user.user_id}, Email: ${user.email}, Subscription Status: ${user.subscription_status}`);
    });

    // Also check user_usage table
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .limit(10);

    if (usageError) {
      console.error('Error fetching user usage:', usageError);
      return;
    }

    console.log('\nUsers in user_usage table:');
    usageData.forEach(usage => {
      console.log(`User ID: ${usage.user_id}, Plan: ${usage.plan_type}, Credits: ${usage.credits_remaining}, Status: ${usage.subscription_status}`);
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();
