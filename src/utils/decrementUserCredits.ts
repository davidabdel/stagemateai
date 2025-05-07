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
