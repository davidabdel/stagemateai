import { supabase } from './supabaseClient';

// Check if user is authenticated
export async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

// Check if user is an admin
export async function checkAdminAuth() {
  try {
    const user = await checkAuth();
    
    if (!user) {
      return { user: null, isAdmin: false };
    }
    
    // Check if user is the specific admin email (david@uconnect.com.au)
    if (user.email === 'david@uconnect.com.au') {
      return { user, isAdmin: true };
    }
    
    // As a fallback, check if user has admin role in the database
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    return { 
      user, 
      isAdmin: !!data && !error
    };
  } catch (error) {
    console.error("Error checking admin authentication:", error);
    return { user: null, isAdmin: false };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Sign out user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
}
