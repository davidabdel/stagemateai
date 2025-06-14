"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

// Define the auth context type
type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Memoize the sign out function to prevent unnecessary re-renders
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth');
  }, [router]);

  // Memoize session check to prevent unnecessary API calls
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('AuthProvider: Checking for existing session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('AuthProvider: Error getting session:', error);
        return;
      }
      
      if (session?.user) {
        console.log('AuthProvider: Found existing session for user:', session.user.email);
        setUser(session.user);
        
        // If we're on the auth page but already logged in, redirect to dashboard
        if (pathname === '/auth') {
          console.log('AuthProvider: Already logged in, redirecting from auth page to dashboard');
          router.push('/dashboard');
        }
      } else {
        console.log('AuthProvider: No session found');
        
        // If we're on a protected page and not logged in, redirect to auth
        if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
          console.log('AuthProvider: Not logged in, redirecting from protected page to auth');
          router.push('/auth');
        }
      }
    } catch (err) {
      console.error('AuthProvider: Error checking session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Memoize auth state change handler to prevent recreation on every render
  const handleAuthStateChange = useCallback(async (event: any, session: any) => {
    console.log('AuthProvider: Auth state changed:', event, session ? 'Session exists' : 'No session');
    
    if (event === 'SIGNED_IN' && session) {
      console.log('AuthProvider: User signed in:', session.user.email);
      setUser(session.user);
      
      // Only redirect if we're on the main auth page, not callback
      if (window.location.pathname === '/auth' && !window.location.pathname.includes('/callback')) {
        console.log('AuthProvider: Redirecting from auth page to dashboard after sign in');
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('AuthProvider: User signed out');
      setUser(null);
      
      // Check current path for protected routes
      const currentPath = window.location.pathname;
      if (currentPath?.startsWith('/dashboard') || currentPath?.startsWith('/admin')) {
        console.log('AuthProvider: Redirecting from protected page to auth after sign out');
        router.push('/auth');
      }
    } else if (event === 'TOKEN_REFRESHED' && session) {
      console.log('AuthProvider: Token refreshed for user:', session.user.email);
      setUser(session.user);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, handleAuthStateChange]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    signOut: handleSignOut
  }), [user, isLoading, handleSignOut]);
  
  // Provide the auth context to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
