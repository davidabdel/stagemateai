// This file contains the key credit management functionality that was updated
// The full implementation is in admin-fixed.tsx

// Handle adding credits to a user
const handleAddCredits = async () => {
  if (!selectedUserId) {
    toast.error('Please select a user');
    return;
  }
  
  if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
    toast.error('Please enter a valid number of credits');
    return;
  }
  
  try {
    setIsAddingCredits(true);
    toast.loading('Adding credits...');
    
    // Find the user in our data
    const userIndex = userCredits.findIndex(user => user.user_id === selectedUserId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Get the current user
    const currentUser = userCredits[userIndex];
    
    if (!currentUser.email) {
      throw new Error('User email not found');
    }
    
    console.log('Using dedicated API endpoint to update credits for:', currentUser.email);
    
    // Use our dedicated API endpoint to update credits
    const response = await fetch('/api/admin/update-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email,
        credits: creditsToAdd,
        planType: planType
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Unknown error updating credits');
    }
    
    // Calculate new limit based on API response
    const newLimit = result.after.credits;
    
    // Create updated user object for local state
    const updatedUser = {
      ...currentUser,
      photos_limit: newLimit,
      plan_type: result.after.plan || planType,
      updated_at: new Date().toISOString()
    };
    
    // Update the user in our local state
    const updatedUserCredits = [...userCredits];
    updatedUserCredits[userIndex] = updatedUser;
    
    // Update state
    setUserCredits(updatedUserCredits);
    
    // Update selected user details if this is the currently selected user
    if (selectedUserDetails && selectedUserDetails.user_id === selectedUserId) {
      setSelectedUserDetails(updatedUser);
    }
    
    toast.dismiss();
    toast.success(`Added ${creditsToAdd} credits to user. Previous: ${result.before.credits}, New: ${result.after.credits}`);
    
    // Refresh data to ensure we have the latest from the database
    fetchData();
  } catch (error) {
    console.error('Error adding credits:', error);
    toast.dismiss();
    toast.error(`Failed to add credits: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsAddingCredits(false);
  }
};