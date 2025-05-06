import { supabase } from './supabaseClient';

// Consolidated user interface
export interface ConsolidatedUser {
  id?: string;
  user_id: string;
  email?: string;
  display_name?: string;
  photos_used: number;
  photos_limit: number;
  credits_remaining?: number;
  plan_type: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all consolidated users
 * @returns Promise with users data and error
 */
export async function getAllConsolidatedUsers() {
  try {
    console.log('Fetching all consolidated users');
    
    const { data, error } = await supabase
      .from('consolidated_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching consolidated users:', error);
    return { data: null, error };
  }
}

/**
 * Get a consolidated user by ID
 * @param userId The user ID to look up
 * @returns Promise with user data and error
 */
export async function getConsolidatedUser(userId: string) {
  try {
    console.log('Fetching consolidated user for userId:', userId);
    
    const { data, error } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record exists, return null data without throwing
      if (error.code === 'PGRST116') {
        console.log('No consolidated user found for userId:', userId);
        return { data: null, error: null };
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching consolidated user:', error);
    return { data: null, error };
  }
}

/**
 * Get a consolidated user by email
 * @param email The email to look up
 * @returns Promise with user data and error
 */
export async function getConsolidatedUserByEmail(email: string) {
  try {
    console.log('Fetching consolidated user for email:', email);
    
    const { data, error } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      // If no record exists, return null data without throwing
      if (error.code === 'PGRST116') {
        console.log('No consolidated user found for email:', email);
        return { data: null, error: null };
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching consolidated user by email:', error);
    return { data: null, error };
  }
}

/**
 * Update a consolidated user
 * @param userId The user ID to update
 * @param userData The user data to update
 * @returns Promise with updated user data and error
 */
export async function updateConsolidatedUser(userId: string, userData: Partial<ConsolidatedUser>) {
  try {
    console.log('Updating consolidated user for userId:', userId);
    
    // Remove any fields that shouldn't be directly updated
    const { id, user_id, credits_remaining, created_at, ...updateData } = userData;
    
    // Always update the updated_at timestamp
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('consolidated_users')
      .update(dataToUpdate)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating consolidated user:', error);
    return { data: null, error };
  }
}

/**
 * Create a consolidated user
 * @param userData The user data to create
 * @returns Promise with created user data and error
 */
export async function createConsolidatedUser(userData: ConsolidatedUser) {
  try {
    console.log('Creating consolidated user for userId:', userData.user_id);
    
    // Remove any fields that shouldn't be directly set
    const { id, credits_remaining, ...createData } = userData;
    
    const { data, error } = await supabase
      .from('consolidated_users')
      .insert([createData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating consolidated user:', error);
    return { data: null, error };
  }
}

/**
 * Manually refresh the consolidated users table
 * This will call the database function to repopulate the table
 * @returns Promise with success status and error
 */
export async function refreshConsolidatedUsers() {
  try {
    console.log('Refreshing consolidated users table');
    
    const { data, error } = await supabase
      .rpc('populate_consolidated_users');
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error refreshing consolidated users:', error);
    return { success: false, error };
  }
}
