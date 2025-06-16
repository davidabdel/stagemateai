"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Function to handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth');
  };

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
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
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthProvider: User signed in:', session.user.email);
        setUser(session.user);
        
        // Don't redirect immediately if we're on the auth callback page
        // Let the callback page handle the redirect
        if (pathname === '/auth' && !pathname.includes('/callback')) {
          console.log('AuthProvider: Redirecting from auth page to dashboard after sign in');
          // Add a small delay to ensure smooth transition
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: User signed out');
        setUser(null);
        
        // If we're on a protected page after signing out, redirect to auth
        if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
          console.log('AuthProvider: Redirecting from protected page to auth after sign out');
          router.push('/auth');
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('AuthProvider: Token refreshed for user:', session.user.email);
        setUser(session.user);
      }
    });
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);
  
  // Provide the auth context to children
  return (
    <AuthContext.Provider value={{ user, isLoading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}
