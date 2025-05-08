"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getListings, Listing, deleteListing, getUserCredits, UserCredits } from "@/utils/supabaseService";
import { checkAuth, signOut } from "@/utils/authUtils";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// Create a separate component to handle the search params
function SuccessMessage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Your subscription has been activated.', {
        duration: 5000,
        position: 'top-center',
      });
    }
  }, [searchParams]);
  
  return null;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Store authenticated user information
  const [_user, setUser] = useState<{ id: string, email?: string } | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Check authentication
  useEffect(() => {
    async function checkAuthentication() {
      const user = await checkAuth();
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth');
        return;
      }
      
      // Get user email from Supabase
      const { data: userData } = await supabase.auth.getUser();
      const userWithEmail = {
        ...user,
        email: userData?.user?.email || ''
      };
      
      setUser(userWithEmail);
      
      // Ensure user records exist in the database
      ensureUserRecordsExist(user.id, userData?.user?.email || '');
      
      // Check if subscription has expired and fetch user credits once authenticated
      checkSubscriptionStatus(user.id);
      fetchUserCredits(user.id);
    }
    
    // Function to ensure consolidated_users record exists in the database
    // We skip creating user_usage records due to the foreign key constraint
    async function ensureUserRecordsExist(userId: string, email: string) {
      try {
        console.log('Dashboard: Ensuring consolidated_users record exists for userId:', userId);
        
        // First check if the user already has a record in consolidated_users
        // This is important to avoid duplicate creation attempts
        const { data: existingUser, error: checkError } = await supabase
          .from('consolidated_users')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (existingUser) {
          console.log('Dashboard: User record already exists in consolidated_users, skipping creation');
          return;
        }
        
        console.log('Dashboard: Consolidated user record not found, attempting to create via API');
        
        // Call the API endpoint to create consolidated_users record
        const response = await fetch('/api/create-user-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            email
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Dashboard: API error ${response.status}: ${errorText}`);
          return;
        }
        
        const result = await response.json();
        console.log('Dashboard: User record creation API result:', result);
        
        if (result.success) {
          console.log('Dashboard: Successfully created consolidated_users record');
        } else {
          console.error('Dashboard: Failed to create consolidated_users record:', result.error);
        }
      } catch (error) {
        console.error('Dashboard: Error ensuring consolidated_users record exists:', error);
        // Continue even if there's an error - this is just a safety measure
      }
    }
    
    // Function to check if a canceled subscription has expired
    async function checkSubscriptionStatus(userId: string) {
      try {
        console.log('Dashboard: Checking subscription status for userId:', userId);
        
        // Call the API endpoint to check subscription status using GET method
        const response = await fetch(`/api/check-subscription-status?userId=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('Failed to check subscription status:', response.statusText);
          return;
        }
        
        const data = await response.json();
        
        if (data.status === 'updated') {
          console.log('Subscription has expired and been reset to free plan');
          // Show a notification to the user that their subscription has expired
          setNotification({
            message: 'Your subscription has expired. Your account has been reset to the free plan.',
            type: 'info'
          });
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }
    
    // Function to fetch user credits from database with cache busting
    async function fetchUserCredits(userId: string) {
      try {
        console.log('Dashboard: Fetching user credits for userId:', userId);
        setCreditsLoading(true);
        
        // First, try to sync credits between tables to ensure consistency
        try {
          // Use fetch to call our sync-credits API without requiring admin auth
          // This is a silent operation that happens in the background
          fetch(`/api/sync-credits/silent?userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }).catch(err => {
            // Just log the error but don't fail the main operation
            console.log('Dashboard: Silent credit sync attempt failed:', err);
          });
        } catch (syncErr) {
          // Don't let sync errors affect the main flow
          console.log('Dashboard: Error in silent credit sync:', syncErr);
        }
        
        // Fetch user credits
        const { data, error } = await getUserCredits(userId);
        
        console.log('Dashboard: User credits result:', data, error);
        
        if (error) {
          console.error('Dashboard: Error fetching user credits:', error);
          throw error;
        }
        
        if (data) {
          console.log('Dashboard: Setting user credits:', data);
          console.log('Dashboard: Photos limit:', data.photos_limit);
          console.log('Dashboard: Photos used:', data.photos_used);
          console.log('Dashboard: Remaining photos:', data.photos_limit - data.photos_used);
          console.log('Dashboard: Plan type:', data.plan_type);
        } else {
          console.log('Dashboard: No user credits data returned');
        }
        
        setUserCredits(data);
        
        // If user has no remaining photos, redirect to upgrade page
        if (data && (data.photos_limit - data.photos_used <= 0)) {
          console.log('Dashboard: No remaining photos, redirecting to upgrade page');
          router.push('/dashboard/upgrade');
        }
      } catch (err) {
        console.error("Dashboard: Error fetching user credits:", err);
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
  
  // Handle click outside for profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);
  
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
      <Toaster />
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>
      
      {/* Subscription expiration notification */}
      {notification && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mt-2 rounded-md ${notification.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <p>{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
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
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6ecfc9] text-white font-bold text-lg mx-4 hover:bg-[#5eb8b3] transition-colors"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                {_user?.email?.charAt(0).toUpperCase() || 'M'}
              </button>
              
              {profileMenuOpen && (
                <div ref={profileMenuRef} className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#18181b] rounded-lg shadow-xl z-10 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#6ecfc9] flex items-center justify-center text-white font-bold text-xl">
                          {_user?.email?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {_user?.email?.split('@')[0] || 'My Lovable'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {_user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Credits Used</h3>
                        <Link href="/dashboard/upgrade" className="text-xs text-[#2563eb] hover:text-[#1e40af] dark:text-[#60a5fa] dark:hover:text-[#93c5fd]">
                          Manage
                        </Link>
                      </div>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-[#2563eb] h-2.5 rounded-full" 
                            style={{ width: userCredits ? `${Math.min(100, (userCredits.photos_used / Math.max(1, userCredits.photos_limit)) * 100)}%` : '0%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {userCredits ? userCredits.photos_used : 0}/{userCredits ? userCredits.photos_limit : 0}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {userCredits ? Math.max(0, userCredits.photos_limit - userCredits.photos_used) : 0} credits remaining
                      </p>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#6ecfc9] flex items-center justify-center text-white font-bold text-sm mr-3">
                            {_user?.email?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {_user?.email?.split('@')[0] || 'My Lovable'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {userCredits?.plan_type?.toUpperCase() || 'FREE'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push('/dashboard/upgrade');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Manage Subscription
                    </button>
                    
                    <Link 
                      href="/support"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Help Center
                    </Link>
                    
                    <button 
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await signOut();
                        router.push('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white">Welcome to your Dashboard</h2>
            <div>
              <button 
                className="rounded-lg sm:rounded-full bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base shadow-lg transition-colors w-full sm:w-auto"
                onClick={() => window.location.href = '/dashboard/add-listing'}
              >
                + Add New Listing
              </button>
            </div>
          </div>
          <p className="text-[#475569] dark:text-[#cbd5e1] mb-6">
            Manage your real estate listings and virtual staging projects. You have {creditsLoading ? '...' : 
              userCredits ? Math.max(0, (userCredits.photos_limit - userCredits.photos_used)) : 0
            } photo{(userCredits && (userCredits.photos_limit - userCredits.photos_used) === 1) ? '' : 's'} remaining.
          </p>
          
          {userCredits?.subscription_status === 'canceled' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              <p className="font-bold">Subscription Canceled</p>
              <p>Your subscription has been canceled. You will continue to have access to your {userCredits.plan_type} plan benefits until the end of your billing period.</p>
            </div>
          )}
          
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white">Your Listings</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <select className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm w-full sm:w-auto">
                    <option>All Listings</option>
                    <option>Active</option>
                    <option>Draft</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Search listings..." 
                    className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm w-full sm:w-auto"
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
                <div className="bg-white dark:bg-[#18181b] rounded-xl overflow-x-auto shadow-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">Actions</th>
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
                              className="text-[#2563eb] hover:text-[#1e40af] mr-4 inline-block"
                            >
                              View
                            </Link>
                            <button 
                              className="text-red-600 hover:text-red-800 inline-block"
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
                    {userCredits?.plan_type === 'free' ? 'Free photos remaining' : 'Photos remaining'}
                  </p>
                  <span className="text-2xl font-bold text-[#2563eb]">
                    {userCredits ? Math.max(0, (userCredits.photos_limit - userCredits.photos_used)) : 0}
                  </span>
                </div>
                <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-[#2563eb] h-2.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: userCredits && userCredits.photos_limit > 0 ? 
                        `${Math.min(100, ((userCredits.photos_limit - userCredits.photos_used) / userCredits.photos_limit) * 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  {userCredits && (userCredits.photos_limit - userCredits.photos_used) <= 0 ? (
                    <span className="text-sm text-red-500">No photos remaining</span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Need more photos?</span>
                  )}
                  <Link 
                    href="/dashboard/upgrade" 
                    className="px-4 py-2 bg-[#2563eb] hover:bg-[#1e40af] text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                  >
                    Add Credits
                  </Link>
                </div>
              </>
            )}
          </div>
          

          
          <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Need Help?</h3>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">Our support team is ready to assist you.</p>
            <Link href="/support" className="block w-full rounded-md border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white font-medium px-4 py-2 transition-colors text-center">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
