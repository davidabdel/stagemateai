import { supabase } from './supabaseClient';

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
