// Script to fix user credits and plan issues
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get all users from the auth system
async function getUsers() {
  try {
    // Try to get users from your users table
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUsers:', error);
    return [];
  }
}

// Create or update user_usage record
async function createOrUpdateUserUsage(userId, email, planType = 'standard', photosLimit = 50) {
  try {
    console.log(`Creating/updating user_usage for user ${userId} (${email}) with plan ${planType} and ${photosLimit} credits`);
    
    // Check if user already has a usage record
    const { data: existingData, error: existingError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing user_usage:', existingError);
      return { success: false, error: existingError };
    }
    
    if (existingData) {
      // Update existing record
      console.log(`Updating existing user_usage record for ${userId}`);
      const { data, error } = await supabase
        .from('user_usage')
        .update({
          photos_limit: photosLimit,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating user_usage:', error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } else {
      // Create new record
      console.log(`Creating new user_usage record for ${userId}`);
      const { data, error } = await supabase
        .from('user_usage')
        .insert([{
          user_id: userId,
          photos_limit: photosLimit,
          photos_used: 0,
          plan_type: planType,
          updated_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error creating user_usage:', error);
        return { success: false, error };
      }
      
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserUsage:', error);
    return { success: false, error };
  }
}

// Initialize user_usage for all users
async function initializeAllUsers() {
  try {
    console.log('Initializing user_usage for all users...');
    
    // Get all users
    const users = await getUsers();
    console.log(`Found ${users.length} users`);
    
    // Process each user
    for (const user of users) {
      await createOrUpdateUserUsage(user.id, user.email);
    }
    
    console.log('Successfully initialized user_usage for all users');
    return { success: true };
  } catch (error) {
    console.error('Error in initializeAllUsers:', error);
    return { success: false, error };
  }
}

// Add credits to a specific user
async function addCreditsToUser(userId, credits, planType = 'standard') {
  try {
    console.log(`Adding ${credits} credits to user ${userId} with plan type ${planType}`);
    
    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return { success: false, error: userError };
    }
    
    // Create or update user_usage
    return await createOrUpdateUserUsage(userId, userData.email, planType, credits);
  } catch (error) {
    console.error('Error in addCreditsToUser:', error);
    return { success: false, error };
  }
}

// Main function
async function main() {
  // Command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Please provide a command: initialize-all, add-credits');
    return;
  }
  
  switch (command) {
    case 'initialize-all':
      // Usage: node fix-credits.js initialize-all
      await initializeAllUsers();
      break;
      
    case 'add-credits':
      // Usage: node fix-credits.js add-credits <userId> <credits> [planType]
      const userId = args[1];
      const credits = parseInt(args[2]);
      const planType = args[3] || 'standard';
      
      if (!userId || isNaN(credits)) {
        console.log('Usage: node fix-credits.js add-credits <userId> <credits> [planType]');
        return;
      }
      
      await addCreditsToUser(userId, credits, planType);
      break;
      
    default:
      console.log('Unknown command. Available commands: initialize-all, add-credits');
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
