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
      console.log('No authenticated user found');
      return { user: null, isAdmin: false };
    }
    
    console.log('Checking admin status for user:', user.email);
    
    // Check if user is the specific admin email (david@uconnect.com.au)
    if (user.email === 'david@uconnect.com.au') {
      console.log('Admin access verified for david@uconnect.com.au');
      return { user, isAdmin: true };
    }
    
    console.log('User is not the primary admin, checking admin_users table');
    
    // As a fallback, check if user has admin role in the database
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = !!data && !error;
    console.log('Admin table check result:', isAdmin ? 'Is admin' : 'Not admin');
    
    return { 
      user, 
      isAdmin
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
