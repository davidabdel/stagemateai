import { supabase } from './supabaseClient';

// User credits interface
export interface UserCredits {
  id?: string;
  user_id: string;
  credits_remaining: number;
  plan_type: string;
  updated_at?: string;
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
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record exists, create one with default free credits
      if (error.code === 'PGRST116') {
        return createUserCredits(userId);
      }
      throw error;
    }
    
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
      credits_remaining: 3, // Default free credits
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
export async function updateUserCredits(userId: string, creditsRemaining: number) {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .update({ credits_remaining: creditsRemaining, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating user credits:', error);
    return { data: null, error };
  }
}

// Decrement user credits
export async function decrementUserCredits(userId: string) {
  try {
    // First get current credits
    const { data: currentCredits, error: fetchError } = await getUserCredits(userId);
    
    if (fetchError) throw fetchError;
    if (!currentCredits) throw new Error('No credits record found');
    
    // Calculate new credits value (don't go below 0)
    const newCreditsValue = Math.max(0, currentCredits.credits_remaining - 1);
    
    // Update with new value
    const { data, error } = await updateUserCredits(userId, newCreditsValue);
    
    if (error) throw error;
    return { data, error: null, creditsRemaining: newCreditsValue };
  } catch (error) {
    console.error('Error decrementing user credits:', error);
    return { data: null, error, creditsRemaining: 0 };
  }
}
