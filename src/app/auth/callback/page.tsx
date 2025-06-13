"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a hash fragment with tokens
        if (window.location.hash) {
          console.log("Auth callback: Hash fragment detected, handling implicit flow");
          
          // Let Supabase handle the hash fragment
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Auth callback: Error getting session from hash:", error);
            router.push("/auth?error=" + encodeURIComponent(error.message));
            return;
          }

          if (data?.session) {
            console.log("Auth callback: Session established from hash");
            
            // Check if this is a new user
            const user = data.session.user;
            const isNewUser = user.app_metadata.provider === "google" && 
                             user.created_at && user.last_sign_in_at &&
                             new Date(user.created_at).getTime() === 
                             new Date(user.last_sign_in_at).getTime();
            
            if (isNewUser) {
              console.log("Auth callback: New Google user detected, creating user records");
              
              try {
                const response = await fetch('/api/create-user-records', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0]
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
            
            // Redirect to dashboard
            console.log("Auth callback: Redirecting to dashboard");
            router.push("/dashboard");
          } else {
            console.log("Auth callback: No session found in hash");
            router.push("/auth?error=no_session");
          }
        } else {
          // No hash fragment, check if we're being handled by the route handler
          // If we got here without a hash, the route handler should have processed it
          console.log("Auth callback: No hash fragment, checking for errors");
          const params = new URLSearchParams(window.location.search);
          const error = params.get('error');
          if (error) {
            router.push(`/auth?error=${error}`);
          } else {
            // Wait a moment for the route handler to complete
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Auth callback: Unexpected error:", err);
        router.push("/auth?error=unexpected_error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}