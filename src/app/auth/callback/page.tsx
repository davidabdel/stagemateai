"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        // Handle authorization code flow
        if (code) {
          console.log("Auth callback: Authorization code detected, exchanging for session");
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Auth callback: Error exchanging code:", error);
            router.push("/auth?error=" + encodeURIComponent(error.message));
            return;
          }
          
          console.log("Auth callback: Code exchanged successfully");
        }
        
        // Check if we have a hash fragment with tokens (implicit flow)
        else if (window.location.hash) {
          console.log("Auth callback: Hash fragment detected, handling implicit flow");
          // Supabase will automatically handle the hash fragment
        }
        
        // Get the current session (works for both flows)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Auth callback: Error getting session:", sessionError);
          router.push("/auth?error=" + encodeURIComponent(sessionError.message));
          return;
        }

        if (sessionData?.session) {
          console.log("Auth callback: Session established");
          
          // Check if this is a new user
          const user = sessionData.session.user;
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
          window.location.href = "/dashboard";
        } else {
          console.log("Auth callback: No session found");
          router.push("/auth?error=no_session");
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