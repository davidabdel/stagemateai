import { supabase } from './supabaseClient';

// Update user credits based on subscription
export async function updateUserCreditsForSubscription(
  userId: string | null, 
  userEmail: string | null, 
  priceId: string
) {
  try {
    console.log(`Updating credits for user: ${userId || userEmail} with priceId: ${priceId}`);
    
    // If we only have email, find the user ID
    let actualUserId = userId;
    if (!actualUserId && userEmail) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (userError || !userData) {
        throw new Error(`User not found for email: ${userEmail}`);
      }
      
      actualUserId = userData.id;
    }
    
    if (!actualUserId) {
      throw new Error('No user ID available');
    }
    
    // Get the plan details from the subscription_plans table
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();
    
    if (planError || !planData) {
      // If the plan is not found by price ID, check if it's a special case like 'free'
      if (priceId === 'free') {
        // Set default free plan values
        await updateUserCredits(actualUserId, 3, 'free');
        return;
      }
      
      throw new Error(`Plan not found for price ID: ${priceId}`);
    }
    
    // Update user credits based on the plan
    await updateUserCredits(actualUserId, planData.credits, planData.name.toLowerCase());
    
    console.log(`Updated user ${actualUserId} to plan ${planData.name} with ${planData.credits} credits`);
  } catch (error) {
    console.error('Error updating user credits for subscription:', error);
    throw error;
  }
}

// Update user credits
export async function updateUserCredits(
  userId: string, 
  photosLimit: number, 
  planType: string
) {
  try {
    console.log(`Setting user ${userId} to ${photosLimit} credits with plan type ${planType}`);
    
    // Check if user exists in user_usage table
    const { data: existingData, error: existingError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      // If error is not "no rows returned", it's a real error
      throw existingError;
    }
    
    if (!existingData) {
      // User doesn't exist in user_usage table, create new record
      const { error: insertError } = await supabase
        .from('user_usage')
        .insert([{
          user_id: userId,
          photos_limit: photosLimit,
          photos_used: 0,
          plan_type: planType,
          updated_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        throw insertError;
      }
    } else {
      // User exists, update record
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          photos_limit: photosLimit,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        throw updateError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user credits:', error);
    return { success: false, error };
  }
}

// Get subscription plan by price ID
export async function getSubscriptionPlanByPriceId(priceId: string) {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting subscription plan:', error);
    return { data: null, error };
  }
}

// Fix plan names in user_usage table
export async function fixPlanNames() {
  try {
    // Update 'free' and 'trial' plan types to 'standard'
    const { error } = await supabase
      .from('user_usage')
      .update({ plan_type: 'standard' })
      .in('plan_type', ['free', 'trial']);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error fixing plan names:', error);
    return { success: false, error };
  }
}

// Deactivate Free and Trial plans in subscription_plans table
export async function deactivateUnusedPlans() {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_active: false })
      .in('name', ['Free', 'Trial']);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deactivating unused plans:', error);
    return { success: false, error };
  }
}
