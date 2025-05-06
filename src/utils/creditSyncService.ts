import { supabase } from './supabaseClient';

/**
 * Synchronizes credit data between consolidated_users and user_usage tables
 * @param userId The user ID to synchronize credits for
 */
export async function syncUserCredits(userId: string) {
  try {
    console.log(`Syncing credits for user ${userId}`);
    
    // First, get the data from consolidated_users
    const { data: consolidatedData, error: consolidatedError } = await supabase
      .from('consolidated_users')
      .select('photos_limit')
      .eq('id', userId)
      .single();
    
    if (consolidatedError) {
      console.error('Error fetching consolidated user data:', consolidatedError);
      return { success: false, error: consolidatedError };
    }
    
    if (!consolidatedData) {
      console.log(`No consolidated data found for user ${userId}`);
      return { success: false, error: 'No consolidated data found' };
    }
    
    // Now get the user_usage data
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // If user_usage record doesn't exist, create it
    if (usageError && usageError.code === 'PGRST116') {
      console.log(`Creating new user_usage record for user ${userId}`);
      
      const newUserUsage = {
        user_id: userId,
        photos_limit: consolidatedData.photos_limit,
        photos_used: 0,
        plan_type: 'standard', // Default to standard or determine from consolidated_users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('user_usage')
        .insert([newUserUsage]);
      
      if (insertError) {
        console.error('Error creating user_usage record:', insertError);
        return { success: false, error: insertError };
      }
      
      return { success: true, message: 'Created new user_usage record with synchronized credits' };
    } else if (usageError) {
      console.error('Error fetching user_usage data:', usageError);
      return { success: false, error: usageError };
    }
    
    // If photos_limit is different, update user_usage
    if (usageData && usageData.photos_limit !== consolidatedData.photos_limit) {
      console.log(`Updating user_usage for ${userId}: ${usageData.photos_limit} -> ${consolidatedData.photos_limit}`);
      
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({ 
          photos_limit: consolidatedData.photos_limit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating user_usage:', updateError);
        return { success: false, error: updateError };
      }
      
      return { success: true, message: 'Synchronized credits between tables' };
    }
    
    console.log(`Credits already in sync for user ${userId}`);
    return { success: true, message: 'Credits already in sync' };
    
  } catch (error) {
    console.error('Error in syncUserCredits:', error);
    return { success: false, error };
  }
}

/**
 * Synchronizes credits for all users in the system
 */
export async function syncAllUserCredits() {
  try {
    console.log('Starting credit synchronization for all users');
    
    // Get all users from consolidated_users
    const { data: consolidatedUsers, error: fetchError } = await supabase
      .from('consolidated_users')
      .select('id');
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return { success: false, error: fetchError };
    }
    
    if (!consolidatedUsers || consolidatedUsers.length === 0) {
      console.log('No users found to synchronize');
      return { success: true, message: 'No users found' };
    }
    
    console.log(`Found ${consolidatedUsers.length} users to synchronize`);
    
    // Process each user
    const results = await Promise.all(
      consolidatedUsers.map(user => syncUserCredits(user.id))
    );
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`Credit synchronization complete. Success: ${successCount}, Failures: ${failureCount}`);
    
    return { 
      success: true, 
      message: `Synchronized ${successCount} users, ${failureCount} failures` 
    };
    
  } catch (error) {
    console.error('Error in syncAllUserCredits:', error);
    return { success: false, error };
  }
}
