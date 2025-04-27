"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getListings, Listing, deleteListing, getUserCredits, UserCredits } from "@/utils/supabaseService";
import { checkAuth, signOut } from "@/utils/authUtils";
import { supabase } from "@/utils/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  
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
      
      // Fetch user credits once authenticated
      fetchUserCredits(user.id);
    }
    
    // Function to fetch user credits
    async function fetchUserCredits(userId: string) {
      try {
        setCreditsLoading(true);
        const { data, error } = await getUserCredits(userId);
        
        if (error) throw error;
        
        setUserCredits(data);
        
        // If credits are 0, redirect to upgrade page
        if (data && data.credits_remaining === 0) {
          router.push('/dashboard/upgrade');
        }
      } catch (err) {
        console.error("Error fetching user credits:", err);
      } finally {
        setCreditsLoading(false);
      }
    }
    
    checkAuthentication();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);
  
  // Fetch listings from Supabase
  useEffect(() => {
    async function fetchListings() {
      try {
        setIsLoading(true);
        const { data, error } = await getListings();
        
        if (error) throw error;
        
        setListings(data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load listings");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchListings();
  }, []);
  
  // Handle deleting a listing
  const handleDeleteListing = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const { error } = await deleteListing(id);
        
        if (error) throw error;
        
        // Update the listings state
        setListings(listings.filter(listing => listing.id !== id));
      } catch (err) {
        console.error("Error deleting listing:", err);
        alert("Failed to delete listing");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2563eb]">StageMate AI</h1>
          <nav className="flex items-center">
            <Link href="#" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Settings
            </Link>
            <button 
              onClick={async () => {
                await signOut();
                router.push('/');
              }} 
              className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] bg-transparent border-none cursor-pointer"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white">Welcome to your Dashboard</h2>
            <div>
              <button 
                className="rounded-full bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold px-6 py-3 text-base shadow-lg transition-colors"
                onClick={() => window.location.href = '/dashboard/add-listing'}
              >
                + Add New Listing
              </button>
            </div>
          </div>
          <p className="text-[#475569] dark:text-[#cbd5e1] mb-6">
            Manage your real estate listings and virtual staging projects. You have 3 free photos available.
          </p>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'listings' 
                  ? 'border-[#2563eb] text-[#2563eb] dark:text-[#60a5fa]' 
                  : 'border-transparent text-[#64748b] dark:text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#cbd5e1]'}`}
              >
                My Listings
              </button>
            </nav>
          </div>
          
          {/* Listings Tab Content */}
          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white">Your Listings</h3>
                <div className="flex space-x-2">
                  <select className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm">
                    <option>All Listings</option>
                    <option>Active</option>
                    <option>Draft</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Search listings..." 
                    className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-8 text-center">
                  <p className="text-[#64748b] dark:text-[#94a3b8]">Loading listings...</p>
                </div>
              ) : error ? (
                <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-8 text-center">
                  <p className="text-[#64748b] dark:text-[#94a3b8]">{error}</p>
                  <button 
                    className="mt-4 rounded-md bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold px-4 py-2 text-sm shadow-lg transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : listings.length === 0 ? (
                /* Empty State */
                <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-8 text-center">
                  <div className="mb-4 text-[#64748b] dark:text-[#94a3b8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-[#1d2939] dark:text-white mb-2">No listings yet</h4>
                  <p className="text-[#64748b] dark:text-[#94a3b8] mb-6">Create your first real estate listing to get started with virtual staging</p>
                  <button 
                    className="rounded-full bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold px-6 py-3 text-base shadow-lg transition-colors"
                    onClick={() => window.location.href = '/dashboard/add-listing'}
                  >
                    Add Your First Listing
                  </button>
                </div>
              ) : (
                /* Listings Table */
                <div className="bg-white dark:bg-[#18181b] rounded-xl overflow-hidden shadow-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#18181b] divide-y divide-gray-200 dark:divide-gray-700">
                      {listings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{listing.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{listing.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/dashboard/listing/${listing.id}`}
                              className="text-[#2563eb] hover:text-[#1e40af] mr-4"
                            >
                              View
                            </Link>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteListing(listing.id || '')}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          

        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Usage</h3>
            {creditsLoading ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2563eb]"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[#64748b] dark:text-[#94a3b8]">
                    {userCredits?.plan_type === 'free' ? 'Free photos remaining' : 'Credits remaining'}
                  </p>
                  <span className="text-2xl font-bold text-[#2563eb]">
                    {userCredits?.credits_remaining || 0}
                  </span>
                </div>
                <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-[#2563eb] h-2.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: userCredits ? `${Math.min(100, (userCredits.credits_remaining / 3) * 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
                {userCredits?.credits_remaining === 0 && (
                  <div className="mt-3">
                    <Link 
                      href="/dashboard/upgrade" 
                      className="text-sm text-[#2563eb] hover:underline"
                    >
                      Upgrade for more credits
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          

          
          <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Need Help?</h3>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">Our support team is ready to assist you.</p>
            <button className="w-full rounded-md border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white font-medium px-4 py-2 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
