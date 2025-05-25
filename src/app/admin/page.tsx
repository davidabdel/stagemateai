"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            setAuthError("Session error: " + sessionError.message);
            setLoading(false);
          }
          return;
        }
        
        if (!sessionData.session) {
          console.log("No active session found");
          if (isMounted) {
            setAuthError("Please sign in to access the admin page");
            setLoading(false);
          }
          return;
        }
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Authentication error:", error);
          if (isMounted) {
            setAuthError("Authentication error: " + error.message);
            setLoading(false);
          }
          return;
        }
        
        if (!user) {
          console.error("No user found despite having session");
          if (isMounted) {
            setAuthError("No user found. Please sign in again.");
            setLoading(false);
          }
          return;
        }

        console.log("Current user:", user.email);
        
        // Check if user is the admin (david@uconnect.com.au)
        if (user.email === "david@uconnect.com.au") {
          console.log("Admin access verified");
          if (isMounted) {
            setIsAdmin(true);
            setLoading(false);
          }
        } else {
          console.error("Unauthorized access attempt by:", user.email);
          if (isMounted) {
            setAuthError(`Access denied. Only david@uconnect.com.au can access the admin page.`);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        if (isMounted) {
          setAuthError("An unexpected error occurred. Please try again.");
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          {authError ? (
            <p className="mt-4 text-gray-700">{authError}</p>
          ) : (
            <p className="mt-4 text-gray-700">You do not have permission to access this page.</p>
          )}
          
          <div className="mt-6">
            <button 
              onClick={() => router.push('/auth')} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}