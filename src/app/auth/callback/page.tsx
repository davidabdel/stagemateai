"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";

// Wrap the component that uses useSearchParams in Suspense
// This is required in Next.js 15 as mentioned in your project memories
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Processing your sign-in...");
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Prevent redirect loops by tracking if we've already attempted a redirect
    if (redirectAttempted) return;

    // Check for error parameter in URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Redirect to auth page after 3 seconds
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
      return;
    }

    const handleAuth = async () => {
      try {
        console.log("Auth callback: Checking for auth tokens in URL hash");
        
        // If we have a hash with access_token, explicitly process it
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log("Auth callback: Found access_token in URL hash, setting session");
          
          // Process the hash and set the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Auth callback: Error setting session from hash:", error);
            setError("Authentication failed. Please try again.");
            setRedirectAttempted(true);
            setTimeout(() => router.push("/auth"), 3000);
            return;
          }
          
          if (data?.session) {
            console.log("Auth callback: Successfully set session from hash");
            
            // Force refresh the auth state
            await supabase.auth.refreshSession();
            
            // Check if this is a new user
            const isNewUser = data.session.user.app_metadata.provider === "google" && 
                             data.session.user.created_at && data.session.user.last_sign_in_at &&
                             new Date(data.session.user.created_at).getTime() === 
                             new Date(data.session.user.last_sign_in_at).getTime();
            
            if (isNewUser) {
              console.log("Auth callback: New user detected, creating user records");
              
              // Create user records in our custom tables
              try {
                const response = await fetch('/api/create-user-records', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: data.session.user.id,
                    email: data.session.user.email,
                    name: data.session.user.user_metadata?.full_name || 
                          data.session.user.user_metadata?.name || 
                          data.session.user.email?.split('@')[0]
                  }),
                });
                
                const result = await response.json();
                console.log('User records creation result:', result);
                
                if (!response.ok) {
                  console.error('Failed to create user records:', result);
                }
              } catch (error) {
                console.error('Error creating user records:', error);
                // Continue despite error - user was created in auth
              }
            }
            
            setMessage("Sign-in successful! Redirecting to dashboard...");
            
            // Redirect to dashboard after a short delay
            setRedirectAttempted(true);
            // Use window.location for a hard redirect to avoid Next.js router issues
            setTimeout(() => window.location.href = "/dashboard", 1500);
            return;
          }
        }
        
        // If no hash or no session from hash, check for existing session
        console.log("Auth callback: Checking for existing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback: Error getting session:", error);
          setError("Authentication failed. Please try again.");
          setRedirectAttempted(true);
          setTimeout(() => router.push("/auth"), 3000);
          return;
        }
        
        if (data?.session) {
          console.log("Auth callback: Existing session found");
          
          // Check if this is a new user (for users coming from route handler)
          const isNewUser = data.session.user.app_metadata.provider === "google" && 
                           data.session.user.created_at && data.session.user.last_sign_in_at &&
                           new Date(data.session.user.created_at).getTime() === 
                           new Date(data.session.user.last_sign_in_at).getTime();
          
          if (isNewUser) {
            console.log("Auth callback: New user detected (from route handler), creating user records");
            
            // Create user records in our custom tables
            try {
              const response = await fetch('/api/create-user-records', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: data.session.user.id,
                  email: data.session.user.email,
                  name: data.session.user.user_metadata?.full_name || 
                        data.session.user.user_metadata?.name || 
                        data.session.user.email?.split('@')[0]
                }),
              });
              
              const result = await response.json();
              console.log('User records creation result:', result);
              
              if (!response.ok) {
                console.error('Failed to create user records:', result);
              }
            } catch (error) {
              console.error('Error creating user records:', error);
              // Continue despite error - user was created in auth
            }
          }
          
          setMessage("Sign-in successful! Redirecting to dashboard...");
          setRedirectAttempted(true);
          // Use window.location for a hard redirect
          setTimeout(() => window.location.href = "/dashboard", 1500);
        } else {
          console.log("Auth callback: No session found");
          setError("No authentication session found. Please try signing in again.");
          setRedirectAttempted(true);
          setTimeout(() => router.push("/auth"), 3000);
        }
      } catch (err) {
        console.error("Auth callback: Unexpected error:", err);
        setError("An unexpected error occurred. Please try again.");
        setRedirectAttempted(true);
        setTimeout(() => router.push("/auth"), 3000);
      }
    };

    // Handle the authentication flow
    handleAuth();
  }, [router, searchParams, redirectAttempted]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="StageMATE AI Logo" 
              width={80} 
              height={80} 
              className="rounded-full"
            />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {error ? "Authentication Error" : "Authentication"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error ? error : message}
          </p>
        </div>
        {/* Add a loading spinner */}
        {!error && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary for Next.js 15 compatibility
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Loading</h2>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
