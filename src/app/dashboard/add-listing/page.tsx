"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createListing } from "@/utils/supabaseService";
import { checkAuth } from "@/utils/authUtils";

export default function AddListing() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    address: ""
  });
  
  // Check authentication
  useEffect(() => {
    async function checkAuthentication() {
      const user = await checkAuth();
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth');
        return;
      }
      setUser(user);
    }
    
    checkAuthentication();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // State for tracking form submission status and errors
  const [_submitting, setSubmitting] = useState(false);
  const [_submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    
    try {
      // Save to Supabase with user ID
      const { error } = await createListing({
        title: formData.title,
        address: formData.address,
        user_id: user?.id
      });
      
      if (error) {
        throw error;
      }
      
      alert("Listing created successfully! Redirecting to dashboard...");
      // Redirect back to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Error creating listing:", err);
      setSubmitError("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            <img 
              src="/images/3.png" 
              alt="StageMate Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
          <nav className="flex items-center">
            <Link href="/dashboard" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa]">
              Back to Dashboard
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white">Add New Listing</h2>
            <p className="text-[#475569] dark:text-[#cbd5e1] mt-2">
              Fill in the details below to create a new real estate listing.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Listing Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Modern Apartment in Downtown"
                  className="w-full rounded-md border border-[#e5e7eb] dark:border-[#334155] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-[#f8fafc] dark:bg-[#23272f] text-[#1e293b] dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Address*
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 123 Main St, City, State"
                  className="w-full rounded-md border border-[#e5e7eb] dark:border-[#334155] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-[#f8fafc] dark:bg-[#23272f] text-[#1e293b] dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Link 
                href="/dashboard" 
                className="rounded-md border border-[#e5e7eb] dark:border-[#334155] px-6 py-3 text-[#64748b] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#27272a] font-medium transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                className="rounded-md bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold px-6 py-3 shadow-lg transition-colors"
              >
                Create Listing
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
