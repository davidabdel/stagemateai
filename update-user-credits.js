// Script to update user credits and fix plan names
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to update user credits
async function updateUserCredits(userId, photosLimit, planType) {
  try {
    console.log(`Updating user ${userId} with ${photosLimit} credits and plan type ${planType}`);
    
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return { success: false, error: userError };
    }
    
    // Update user credits
    const { data, error } = await supabase
      .from('user_usage')
      .update({
        photos_limit: photosLimit,
        plan_type: planType,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating user credits:', error);
      return { success: false, error };
    }
    
    console.log(`Successfully updated user ${userId} with ${photosLimit} credits and plan type ${planType}`);
    return { success: true, data };
  } catch (error) {
    console.error('Error in updateUserCredits:', error);
    return { success: false, error };
  }
}

// Function to fix plan names
async function fixPlanNames() {
  try {
    console.log('Fixing plan names...');
    
    // Update 'free' and 'trial' plan types to 'standard' or 'agency'
    const { data, error } = await supabase
      .from('user_usage')
      .update({ plan_type: 'standard' })
      .in('plan_type', ['free', 'trial']);
    
    if (error) {
      console.error('Error fixing plan names:', error);
      return { success: false, error };
    }
    
    console.log('Successfully fixed plan names');
    return { success: true, data };
  } catch (error) {
    console.error('Error in fixPlanNames:', error);
    return { success: false, error };
  }
}

// Function to list all users and their credits
async function listUsers() {
  try {
    console.log('Listing all users...');
    
    const { data, error } = await supabase
      .from('user_usage')
      .select('*');
    
    if (error) {
      console.error('Error listing users:', error);
      return { success: false, error };
    }
    
    console.log('Users:');
    data.forEach(user => {
      console.log(`User ID: ${user.user_id}, Plan: ${user.plan_type}, Credits: ${user.photos_limit}, Used: ${user.photos_used}`);
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in listUsers:', error);
    return { success: false, error };
  }
}

// Function to fix subscription plans table
async function fixSubscriptionPlans() {
  try {
    console.log('Fixing subscription plans...');
    
    // Get all subscription plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (plansError) {
      console.error('Error fetching subscription plans:', plansError);
      return { success: false, error: plansError };
    }
    
    // Check for Free and Trial plans
    const freePlan = plans.find(p => p.name === 'Free');
    const trialPlan = plans.find(p => p.name === 'Trial');
    
    // Update or delete Free plan
    if (freePlan) {
      console.log('Updating Free plan to inactive...');
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', freePlan.id);
      
      if (updateError) {
        console.error('Error updating Free plan:', updateError);
      }
    }
    
    // Update or delete Trial plan
    if (trialPlan) {
      console.log('Updating Trial plan to inactive...');
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', trialPlan.id);
      
      if (updateError) {
        console.error('Error updating Trial plan:', updateError);
      }
    }
    
    console.log('Successfully fixed subscription plans');
    return { success: true };
  } catch (error) {
    console.error('Error in fixSubscriptionPlans:', error);
    return { success: false, error };
  }
}

// Main function
async function main() {
  // Command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Please provide a command: update-credits, fix-plans, list-users, or fix-subscription-plans');
    return;
  }
  
  switch (command) {
    case 'update-credits':
      // Usage: node update-user-credits.js update-credits <userId> <photosLimit> <planType>
      const userId = args[1];
      const photosLimit = parseInt(args[2]);
      const planType = args[3] || 'standard';
      
      if (!userId || isNaN(photosLimit)) {
        console.log('Usage: node update-user-credits.js update-credits <userId> <photosLimit> [planType]');
        return;
      }
      
      await updateUserCredits(userId, photosLimit, planType);
      break;
      
    case 'fix-plans':
      // Usage: node update-user-credits.js fix-plans
      await fixPlanNames();
      break;
      
    case 'list-users':
      // Usage: node update-user-credits.js list-users
      await listUsers();
      break;
      
    case 'fix-subscription-plans':
      // Usage: node update-user-credits.js fix-subscription-plans
      await fixSubscriptionPlans();
      break;
      
    default:
      console.log('Unknown command. Available commands: update-credits, fix-plans, list-users, fix-subscription-plans');
  }
}

// Run the script
main()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
