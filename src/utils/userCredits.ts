import { supabase } from './supabaseClient';

/**
 * Decrements the user's photo credits by 1 and returns the remaining credits
 * @param userId The user's ID
 * @returns An object containing the number of photos remaining and any error
 */
export async function decrementUserCredits(userId: string) {
  try {
    // First, get the user's current usage
    const { data: userData, error: fetchError } = await supabase
      .from('user_usage')
      .select('photos_used, photos_limit')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return { error: fetchError };
    }
    
    const photosUsed = userData?.photos_used || 0;
    const photosLimit = userData?.photos_limit || 0;
    
    // Increment the photos_used count
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({ photos_used: photosUsed + 1 })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return { error: updateError };
    }
    
    // Calculate remaining photos
    const photosRemaining = Math.max(0, photosLimit - (photosUsed + 1));
    
    return { photosRemaining, error: null };
  } catch (error) {
    console.error('Unexpected error in decrementUserCredits:', error);
    return { error };
  }
}