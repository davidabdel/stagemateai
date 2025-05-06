import { supabase } from './supabaseClient';

/**
 * Creates all necessary records for a new user in the database
 * This function handles creating records in both user_usage and consolidated_users tables
 */
export async function createNewUserRecords(userId: string, email: string) {
  try {
    console.log(`Creating database records for new user: ${userId}`);
    
    // Default values for a new free user
    const defaultValues = {
      user_id: userId,
      email: email,
      photos_limit: 3, // Default free photo limit
      photos_used: 0,
      plan_type: 'free',
      subscription_status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // First, check if the user already exists in user_usage to avoid duplicates
    const { data: existingUserUsage, error: checkError } = await supabase
      .from('user_usage')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if user exists in user_usage:', checkError);
      throw checkError;
    }
    
    // Create user_usage record if it doesn't exist
    if (!existingUserUsage) {
      console.log(`Creating user_usage record for user ${userId}`);
      
      const { error: usageError } = await supabase
        .from('user_usage')
        .insert([{
          user_id: userId,
          photos_limit: defaultValues.photos_limit,
          photos_used: defaultValues.photos_used,
          plan_type: defaultValues.plan_type,
          subscription_status: defaultValues.subscription_status,
          created_at: defaultValues.created_at,
          updated_at: defaultValues.updated_at
        }]);
      
      if (usageError) {
        console.error('Error creating user_usage record:', usageError);
        throw usageError;
      }
      
      console.log(`Successfully created user_usage record for user ${userId}`);
    }
    
    // Now check if user exists in consolidated_users
    const { data: existingConsolidated, error: consolidatedCheckError } = await supabase
      .from('consolidated_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (consolidatedCheckError && consolidatedCheckError.code !== 'PGRST116') {
      console.error('Error checking if user exists in consolidated_users:', consolidatedCheckError);
      // Continue even if there's an error checking consolidated_users
    }
    
    // Create consolidated_users record if it doesn't exist
    if (!existingConsolidated) {
      console.log(`Creating consolidated_users record for user ${userId}`);
      
      try {
        const { error: consolidatedError } = await supabase
          .from('consolidated_users')
          .insert([{
            user_id: userId,
            email: email,
            photos_limit: defaultValues.photos_limit,
            photos_used: defaultValues.photos_used,
            plan_type: defaultValues.plan_type,
            subscription_status: defaultValues.subscription_status,
            created_at: defaultValues.created_at,
            updated_at: defaultValues.updated_at
          }]);
        
        if (consolidatedError) {
          console.error('Error creating consolidated_users record:', consolidatedError);
          // Continue even if there's an error with consolidated_users
        } else {
          console.log(`Successfully created consolidated_users record for user ${userId}`);
        }
      } catch (consolidatedError) {
        console.error('Exception creating consolidated_users record:', consolidatedError);
        // Continue even if there's an exception with consolidated_users
      }
    }
    
    return { success: true, message: 'User records created successfully' };
  } catch (error) {
    console.error('Error creating user records:', error);
    return { success: false, message: 'Failed to create user records', error };
  }
}
