"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the auth page which handles Supabase authentication
    router.push("/auth");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to signup page...</p>
    </div>
  );
}
