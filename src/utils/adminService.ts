import { supabase } from './supabaseClient';

// Admin user interface
export interface AdminUser {
  id?: string;
  user_id: string;
  created_at?: string;
}

// Subscription plan interface
export interface SubscriptionPlan {
  id?: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  is_active: boolean;
  created_at?: string;
}

// Credit usage log interface
export interface CreditUsageLog {
  id?: string;
  user_id: string;
  credits_used: number;
  action_type: string;
  created_at?: string;
}

// Check if user is admin
export async function checkAdminStatus(userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    return { isAdmin: !!data, error: null };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, error };
  }
}

// Get all users with their usage data
export async function getAllUsers() {
  try {
    // Get all users from auth.users (requires admin privileges)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    // Get user credits and plan information
    const { data: userUsage, error: usageError } = await supabase
      .from('user_usage')
      .select('*');
    
    if (usageError) throw usageError;
    
    // Get admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (adminError) throw adminError;
    
    // Combine data
    const combinedUsers = authUsers?.users.map(authUser => {
      const usage = userUsage?.find(u => u.user_id === authUser.id);
      const isAdmin = adminUsers?.some(admin => admin.user_id === authUser.id);
      
      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        is_admin: isAdmin || false,
        credits_remaining: usage?.credits_remaining || 0,
        plan_type: usage?.plan_type || 'free'
      };
    }) || [];
    
    return { data: combinedUsers, error: null };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { data: null, error };
  }
}

// Update user credits and plan
export async function updateUserPlan(userId: string, credits: number, planType: string) {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .update({
        credits_remaining: credits,
        plan_type: planType,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user plan:', error);
    return { data: null, error };
  }
}

// Add admin role to user
export async function addAdminRole(userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{ user_id: userId }])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error adding admin role:', error);
    return { data: null, error };
  }
}

// Remove admin role from user
export async function removeAdminRole(userId: string) {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error removing admin role:', error);
    return { error };
  }
}

// Get all subscription plans
export async function getSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return { data: null, error };
  }
}

// Create subscription plan
export async function createSubscriptionPlan(plan: SubscriptionPlan) {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([plan])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return { data: null, error };
  }
}

// Update subscription plan
export async function updateSubscriptionPlan(planId: string, plan: SubscriptionPlan) {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(plan)
      .eq('id', planId)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return { data: null, error };
  }
}

// Toggle subscription plan status
export async function togglePlanStatus(planId: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ is_active: isActive })
      .eq('id', planId)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error toggling plan status:', error);
    return { data: null, error };
  }
}

// Log credit usage
export async function logCreditUsage(userId: string, creditsUsed: number, actionType: string) {
  try {
    const { data, error } = await supabase
      .from('credit_usage_logs')
      .insert([{
        user_id: userId,
        credits_used: creditsUsed,
        action_type: actionType
      }])
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error logging credit usage:', error);
    return { data: null, error };
  }
}

// Get analytics data
export async function getAnalyticsData(days: number) {
  try {
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();
    
    // Fetch daily signups
    const { data: signupData, error: signupError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDateStr);
    
    if (signupError) throw signupError;
    
    // Fetch daily listings
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('created_at')
      .gte('created_at', startDateStr);
    
    if (listingError) throw listingError;
    
    // Fetch daily credits used
    const { data: creditData, error: creditError } = await supabase
      .from('credit_usage_logs')
      .select('created_at, credits_used')
      .gte('created_at', startDateStr);
    
    if (creditError) throw creditError;
    
    // Fetch plan distribution
    const { data: planData, error: planError } = await supabase
      .from('user_usage')
      .select('plan_type');
    
    if (planError) throw planError;
    
    return {
      data: {
        signupData: signupData || [],
        listingData: listingData || [],
        creditData: creditData || [],
        planData: planData || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return { data: null, error };
  }
}

// Get admin dashboard stats
export async function getAdminDashboardStats() {
  try {
    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Get active subscriptions count
    const { count: subscriptionsCount, error: subscriptionsError } = await supabase
      .from('user_usage')
      .select('*', { count: 'exact', head: true })
      .neq('plan_type', 'free');
    
    if (subscriptionsError) throw subscriptionsError;
    
    // Get total listings count
    const { count: listingsCount, error: listingsError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });
    
    if (listingsError) throw listingsError;
    
    // Get total credits used
    const { data: creditsData, error: creditsError } = await supabase
      .from('credit_usage_logs')
      .select('credits_used');
    
    if (creditsError) throw creditsError;
    
    const totalCreditsUsed = creditsData?.reduce((sum, item) => sum + (item.credits_used || 0), 0) || 0;
    
    return {
      data: {
        totalUsers: usersCount || 0,
        activeSubscriptions: subscriptionsCount || 0,
        totalListings: listingsCount || 0,
        totalCreditsUsed: totalCreditsUsed
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting admin dashboard stats:', error);
    return { data: null, error };
  }
}
