// Alternative script to fix credits by updating photos_limit and photos_used
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
const additionalCredits = 50; // Standard plan credits

async function fixCreditsAlternative() {
  console.log(`Fixing credits for user ${userId} by updating photos_limit`);

  try {
    // Check current data in consolidated_users
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
    
    // Calculate new photos_limit by adding additional credits
    const currentPhotosLimit = userData.photos_limit || 0;
    const currentPhotosUsed = userData.photos_used || 0;
    const newPhotosLimit = currentPhotosLimit + additionalCredits;
    
    console.log(`Updating photos_limit: ${currentPhotosLimit} + ${additionalCredits} = ${newPhotosLimit}`);
    console.log(`Current photos_used: ${currentPhotosUsed}`);
    console.log(`This will result in ${newPhotosLimit - currentPhotosUsed} available credits`);
    
    // Update photos_limit in consolidated_users
    const { error: updateError } = await supabase
      .from('consolidated_users')
      .update({
        photos_limit: newPhotosLimit,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating photos_limit:', updateError.message);
    } else {
      console.log(`Successfully updated photos_limit to ${newPhotosLimit}`);
    }
    
    // Also update user_usage table
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (usageError) {
      console.error('Error fetching user_usage:', usageError.message);
    } else {
      console.log('Current user_usage:', usageData);
      
      // Update photos_limit in user_usage
      const currentUsageLimit = usageData.photos_limit || 0;
      const newUsageLimit = currentUsageLimit + additionalCredits;
      
      const { error: usageUpdateError } = await supabase
        .from('user_usage')
        .update({
          photos_limit: newUsageLimit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (usageUpdateError) {
        console.error('Error updating user_usage:', usageUpdateError.message);
      } else {
        console.log(`Successfully updated user_usage photos_limit to ${newUsageLimit}`);
      }
    }
    
    // Verify the updates
    const { data: updatedUser } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    console.log('Updated user data:', updatedUser);
    console.log(`Available credits after update: ${updatedUser.photos_limit - updatedUser.photos_used}`);
  } catch (error) {
    console.error('Error fixing credits:', error.message);
  }
}

fixCreditsAlternative();
