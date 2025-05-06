"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./admin-fixed";
import { supabase } from "@/utils/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error("Authentication error:", error);
          router.push("/auth");
          return;
        }

        console.log("Current user:", user.email);
        
        // Check if user is the admin (david@uconnect.com.au)
        if (user.email === "david@uconnect.com.au") {
          console.log("Admin access verified");
          setIsAdmin(true);
        } else {
          console.error("Unauthorized access attempt by:", user.email);
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAccess();
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
