import { supabase } from './supabaseClient';

// User credits interface
export interface UserCredits {
  id?: string;
  user_id: string;
  photos_limit: number;
  photos_used: number;
  plan_type: string;
  updated_at?: string;
  subscription_status?: string;
  cancellation_date?: string;
}

export interface Listing {
  id?: string;
  title: string;
  address: string;
  created_at?: string;
  user_id?: string;
}

// Create a new listing
export async function createListing(listing: Listing) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([listing])
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating listing:', error);
    return { data: null, error };
  }
}

// Get all listings
export async function getListings() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { data: null, error };
  }
}

// Get a specific listing by ID
export async function getListingById(id: string) {
  try {
    // Ensure we're using a proper Promise pattern
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching listing:', error);
    return { data: null, error };
  }
}

// Delete a listing
export async function deleteListing(id: string) {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting listing:', error);
    return { error };
  }
}

// Get user credits
export async function getUserCredits(userId: string) {
  try {
    console.log('Fetching user credits for userId:', userId);
    
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('User credits query result:', data, error);
    
    if (error) {
      // If no record exists, create one with default free credits
      if (error.code === 'PGRST116') {
        console.log('No user credits found, creating default credits');
        return createUserCredits(userId);
      }
      throw error;
    }
    
    // Log the data we're returning
    console.log('Returning user credits:', data);
    console.log('Photos limit:', data.photos_limit);
    console.log('Photos used:', data.photos_used);
    console.log('Remaining photos:', data.photos_limit - data.photos_used);
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return { data: null, error };
  }
}

// Create initial user credits
export async function createUserCredits(userId: string) {
  try {
    const newUserCredits = {
      user_id: userId,
      photos_limit: 3, // Default free photo limit
      photos_used: 0, // Initial photos used
      plan_type: 'free'
    };
    
    const { data, error } = await supabase
      .from('user_usage')
      .insert([newUserCredits])
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating user credits:', error);
    return { data: null, error };
  }
}

// Update user credits
export async function updateUserCredits(userId: string, photosLimit: number) {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .update({ photos_limit: photosLimit, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating user credits:', error);
    return { data: null, error };
  }
}

// Increment photo usage for a user
export async function incrementPhotoUsage(userId: string) {
  try {
    console.log('Incrementing photo usage for userId:', userId);
    
    // First get current credits
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    if (!currentCredits) throw new Error('No user credits found');
    
    // Increment photos_used
    const newPhotosUsed = (currentCredits.photos_used || 0) + 1;
    
    // Check if user has remaining photos
    const remainingPhotos = Math.max(0, currentCredits.photos_limit - newPhotosUsed);
    const hasRemainingPhotos = remainingPhotos > 0;
    
    // Update the photos_used count in user_usage table
    const { data, error } = await supabase
      .from('user_usage')
      .update({ photos_used: newPhotosUsed, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    
    // Also update the photos_used in consolidated_users table to keep them in sync
    try {
      const { error: consolidatedError } = await supabase
        .from('consolidated_users')
        .update({ photos_used: newPhotosUsed })
        .eq('id', userId);
      
      if (consolidatedError) {
        console.error('Warning: Failed to update photos_used in consolidated_users:', consolidatedError);
        // Don't throw error here, we'll continue with the main flow
      }
    } catch (syncError) {
      console.error('Error syncing photos_used to consolidated_users:', syncError);
      // Don't throw error here, we'll continue with the main flow
    }
    
    // Return the updated data with remaining photos info
    return { 
      data, 
      error: null, 
      photosRemaining: remainingPhotos,
      hasRemainingPhotos 
    };
  } catch (error) {
    console.error('Error incrementing photo usage:', error);
    return { data: null, error, photosRemaining: 0, hasRemainingPhotos: false };
  }
}

// Decrement user credits (increment photos used)
export async function decrementUserCredits(userId: string) {
  try {
    // First get current user data
    const { data: currentCredits, error: fetchError } = await getUserCredits(userId);
    
    if (fetchError) throw fetchError;
    if (!currentCredits) throw new Error('No user record found');
    
    // Increment photos_used
    const newPhotosUsed = (currentCredits.photos_used || 0) + 1;
    
    // Check if user has remaining photos
    const remainingPhotos = Math.max(0, currentCredits.photos_limit - newPhotosUsed);
    const hasRemainingPhotos = remainingPhotos > 0;
    
    // Update the photos_used count in user_usage table
    const { data, error } = await supabase
      .from('user_usage')
      .update({ photos_used: newPhotosUsed, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    
    // Also update the photos_used in consolidated_users table to keep them in sync
    try {
      const { error: consolidatedError } = await supabase
        .from('consolidated_users')
        .update({ photos_used: newPhotosUsed })
        .eq('id', userId);
      
      if (consolidatedError) {
        console.error('Warning: Failed to update photos_used in consolidated_users:', consolidatedError);
        // Don't throw error here, we'll continue with the main flow
      }
    } catch (syncError) {
      console.error('Error syncing photos_used to consolidated_users:', syncError);
      // Don't throw error here, we'll continue with the main flow
    }
    
    // Return the updated data with remaining photos info
    return { 
      data, 
      error: null, 
      photosRemaining: remainingPhotos,
      hasRemainingPhotos: hasRemainingPhotos 
    };
  } catch (error) {
    console.error('Error updating photos used:', error);
    return { 
      data: null, 
      error, 
      photosRemaining: 0,
      hasRemainingPhotos: false 
    };
  }
}
