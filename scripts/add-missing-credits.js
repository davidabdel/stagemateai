// Script to add missing credits to a user's account after upgrade
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
const creditsToAdd = 50; // Standard plan credits

async function addMissingCredits() {
  console.log(`Adding ${creditsToAdd} missing credits for user ${userId}`);

  try {
    // Check current credits in consolidated_users
    const { data: userData, error: userError } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError.message);
      return;
    }
    
    console.log('Current user data:', userData);
    
    // Calculate new total credits
    const currentCredits = userData.credits_remaining || 0;
    const newTotalCredits = currentCredits + creditsToAdd;
    
    console.log(`Adding credits: ${currentCredits} + ${creditsToAdd} = ${newTotalCredits}`);
    
    // Update credits in consolidated_users
    const { error: updateError } = await supabase
      .from('consolidated_users')
      .update({
        credits_remaining: newTotalCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating credits:', updateError.message);
    } else {
      console.log(`Successfully updated credits to ${newTotalCredits}`);
    }
    
    // Verify the update
    const { data: updatedUser } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    console.log('Updated user data:', updatedUser);
  } catch (error) {
    console.error('Error adding missing credits:', error.message);
  }
}

addMissingCredits();
