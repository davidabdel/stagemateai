"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Explicitly import the SimpleAdminDashboard component to avoid module resolution issues
import SimpleAdminDashboard from "./SimpleAdminDashboard";
import { supabase } from "@/utils/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    async function checkAdminAccess() {
      try {
        console.log('Checking admin access...');
        
        // Get the current session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isMounted) {
            setAuthError("Authentication error. Please try again.");
            setLoading(false);
          }
          return;
        }
        
        if (!session) {
          console.log('No session found');
          if (isMounted) {
            setAuthError("You must be logged in to access this page.");
            setLoading(false);
          }
          return;
        }
        
        // Check if the user's email is in the allowed admin list
        const userEmail = session.user?.email;
        console.log('User email:', userEmail);
        
        if (!userEmail) {
          console.log('No user email found');
          if (isMounted) {
            setAuthError("Unable to verify admin status. Please try again.");
            setLoading(false);
          }
          return;
        }
        
        // List of admin emails
        const adminEmails = [
          'david@uconnect.com.au',
          'david@stagemateai.com.au',
          'david@mail.com.au'
        ];
        
        const isUserAdmin = adminEmails.includes(userEmail.toLowerCase());
        console.log('Is user admin?', isUserAdmin);
        
        if (isMounted) {
          setIsAdmin(isUserAdmin);
          setLoading(false);
          
          if (!isUserAdmin) {
            setAuthError("You do not have permission to access this page.");
          }
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        if (isMounted) {
          setAuthError("An error occurred while checking admin access. Please try again.");
          setLoading(false);
        }
      }
    }
    
    checkAdminAccess();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return isAdmin ? <SimpleAdminDashboard /> : null;
}
