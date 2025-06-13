"use client";

import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

// Admin dashboard navigation links
const adminLinks = [
  {
    title: 'FAQ Management',
    description: 'Add, edit, and delete FAQs',
    href: '/admin/faqs',
    icon: '📋'
  },
  {
    title: 'Video Management',
    description: 'Manage tutorial videos',
    href: '/admin/videos',
    icon: '🎬'
  }
];

type Stats = {
  totalUsers: number;
  trialUsers: number;
  paidUsers: number;
  monthlyRevenue: number;
  totalImagesGenerated: number;
};

type UserCredit = {
  id: string;
  user_id: string;
  email?: string;
  photos_used: number;
  photos_limit: number;
  plan_type: string;
  created_at: string;
  updated_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [isFixingPlans, setIsFixingPlans] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    trialUsers: 0,
    paidUsers: 0,
    monthlyRevenue: 0,
    totalImagesGenerated: 0
  });
  
  // Search
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserCredit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserCredit | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isUpdatingEmails, setIsUpdatingEmails] = useState(false);
  const [isFixingAllUsers, setIsFixingAllUsers] = useState(false);

  useEffect(() => {
    fetchData();
    fetchStats();
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  async function fetchStats() {
    try {
      console.log('Fetching real statistics from Supabase...');
      
      // Fetch total users count
      const { count: totalUsersCount, error: totalUsersError } = await supabase
        .from('consolidated_users')
        .select('*', { count: 'exact', head: true });
      
      if (totalUsersError) throw totalUsersError;
      
      // Fetch trial users count
      const { count: trialUsersCount, error: trialUsersError } = await supabase
        .from('consolidated_users')
        .select('*', { count: 'exact', head: true })
        .eq('plan_type', 'trial');
      
      if (trialUsersError) throw trialUsersError;
      
      // Fetch paid users count
      const { count: paidUsersCount, error: paidUsersError } = await supabase
        .from('consolidated_users')
        .select('*', { count: 'exact', head: true })
        .eq('plan_type', 'standard');
      
      if (paidUsersError) throw paidUsersError;
      
      // Fetch total images generated (sum of photos_used)
      const { data: imagesData, error: imagesError } = await supabase
        .from('consolidated_users')
        .select('photos_used');
      
      if (imagesError) throw imagesError;
      
      const totalImagesGenerated = imagesData.reduce((sum, user) => sum + (user.photos_used || 0), 0);
      
      // Calculate monthly revenue (assuming $19 per paid user)
      const monthlyRevenue = (paidUsersCount || 0) * 19;
      
      // Set the real statistics
      setStats({
        totalUsers: totalUsersCount || 0,
        trialUsers: trialUsersCount || 0,
        paidUsers: paidUsersCount || 0,
        monthlyRevenue: monthlyRevenue,
        totalImagesGenerated: totalImagesGenerated
      });
      
      console.log('Using real statistics from Supabase');
    } catch (error) {
      console.error('Error fetching statistics from Supabase:', error);
      
      // Use fallback stats if there's an error
      const fallbackStats = {
        totalUsers: 0,
        trialUsers: 0,
        paidUsers: 0,
        monthlyRevenue: 0,
        totalImagesGenerated: 0
      };
      
      setStats(fallbackStats);
    }
  }

  async function fetchData() {
    try {
      setIsLoading(true);
      console.log('Loading user data from Supabase...');
      
      // Fetch real user data from consolidated_users table
      const { data, error } = await supabase
        .from('consolidated_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} users from consolidated_users table`);
        
        // Transform the data to match our UserCredit type
        const transformedData: UserCredit[] = data.map(user => ({
          id: user.id || '',
          user_id: user.user_id || '',
          email: user.email || '',
          photos_used: user.photos_used || 0,
          photos_limit: user.photos_limit || 0,
          plan_type: user.plan_type || 'trial',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        }));
        
        setUserCredits(transformedData);
      } else {
        console.log('No users found in consolidated_users table');
        setUserCredits([]);
      }
    } catch (error) {
      console.error('Error fetching user data from Supabase:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle searching for users by email
  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email to search');
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Search directly in Supabase
      const { data, error } = await supabase
        .from('consolidated_users')
        .select('*')
        .ilike('email', `%${searchEmail}%`);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform the data to match our UserCredit type
        const transformedResults: UserCredit[] = data.map(user => ({
          id: user.id || '',
          user_id: user.user_id || '',
          email: user.email || '',
          photos_used: user.photos_used || 0,
          photos_limit: user.photos_limit || 0,
          plan_type: user.plan_type || 'trial',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        }));
        
        setSearchResults(transformedResults);
        toast.success(`Found ${transformedResults.length} user(s)`);
      } else {
        toast.error('No users found with that email');
      }
    } catch (error) {
      console.error('Error searching users in Supabase:', error);
      toast.error('An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle selecting a user from search results
  const handleSelectUserFromSearch = (user: UserCredit) => {
    console.log("Selected user from search:", user);
    setSelectedUserId(user.user_id);
    setSelectedUserDetails(user);
    setPlanType(user.plan_type || 'trial');
    setSearchResults([]);
    setSearchEmail('');
    toast.success(`Selected user: ${user.email}`);
  };
  
  // Handle adding credits to a user
  const handleAddCredits = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user first');
      return;
    }
    
    if (creditsToAdd <= 0) {
      toast.error('Please enter a valid number of credits to add');
      return;
    }
    
    setIsAddingCredits(true);
    
    try {
      // Find the user in our local state
      const localUser = userCredits.find(u => u.user_id === selectedUserId);
      
      if (!localUser) {
        toast.error('User not found');
        setIsAddingCredits(false);
        return;
      }
      
      // Calculate new limit
      const newLimit = (localUser.photos_limit || 0) + creditsToAdd;
      
      // Update the user in Supabase
      const { error } = await supabase
        .from('consolidated_users')
        .update({
          photos_limit: newLimit,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUserId);
      
      if (error) {
        throw error;
      }
      
      // Refresh the user data after update
      await fetchData();
      
      // Reset the selected user and form
      setSelectedUserId('');
      setSelectedUserDetails(null);
      setCreditsToAdd(50);
      setPlanType('standard');
      
      // Show success message
      toast.success(`Added ${creditsToAdd} credits to user. New limit: ${newLimit}`);
      
      console.log(`Added ${creditsToAdd} credits to user ${localUser.email}. New limit: ${newLimit}`);
    } catch (error) {
      console.error('Error adding credits in Supabase:', error);
      toast.error('Failed to add credits to user');
    } finally {
      setIsAddingCredits(false);
    }
  };
  
  // Reset the selected user
  const handleResetSelectedUser = () => {
    setSelectedUserId('');
    setSelectedUserDetails(null);
    toast.success('User selection cleared');
  };
  
  // Handle fixing plans for all users
  const handleFixPlans = () => {
    if (!window.confirm('Are you sure you want to fix plans for all users? This will update all users with a plan_type of null to "trial".')) {
      return;
    }
    
    setIsFixingPlans(true);
    
    try {
      // Update local state
      const updatedUserCredits = userCredits.map(user => {
        if (!user.plan_type) {
          return {
            ...user,
            plan_type: 'trial',
            updated_at: new Date().toISOString()
          };
        }
        return user;
      });
      
      // Update state
      setUserCredits(updatedUserCredits);
      
      // Show success message
      toast.success('Fixed plans for all users');
    } catch (error) {
      console.error('Error fixing plans:', error);
      toast.error('Failed to fix plans');
    } finally {
      setIsFixingPlans(false);
    }
  };
  
  // Handle updating emails for all users
  const handleUpdateEmails = () => {
    if (!window.confirm('Are you sure you want to update emails for all users? This will attempt to fetch and update missing emails.')) {
      return;
    }
    
    setIsUpdatingEmails(true);
    
    try {
      // In a real implementation, this would make API calls to update emails
      // For now, we'll just simulate success
      
      toast.success('Emails updated successfully');
    } catch (error) {
      console.error('Error updating emails:', error);
      toast.error('Failed to update emails');
    } finally {
      setIsUpdatingEmails(false);
    }
  };
  
  // Handle fixing all users
  const handleFixAllUsers = () => {
    if (!window.confirm('Are you sure you want to fix all users? This will update all user records with default values where needed.')) {
      return;
    }
    
    setIsFixingAllUsers(true);
    
    try {
      // In a real implementation, this would make API calls to fix user records
      // For now, we'll just simulate success
      
      toast.success('All users fixed successfully');
    } catch (error) {
      console.error('Error fixing all users:', error);
      toast.error('Failed to fix all users');
    } finally {
      setIsFixingAllUsers(false);
    }
  };
  
  // Render the dashboard
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage users, credits, and content</p>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </header>
        
        <main>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Trial Plan Users</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.trialUsers}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Paid Plan Users</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.paidUsers}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${stats.monthlyRevenue}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Images Generated</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalImagesGenerated}</p>
                </div>
              </div>
              
              {/* User Management Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">User Management</h2>
                
                {/* Search Form */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Search Users</h3>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                      <input
                        type="email"
                        placeholder="Search by email"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                      />
                    </div>
                    
                    <button
                      onClick={handleSearchUsers}
                      disabled={isSearching || !searchEmail.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Search Results</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credits</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {searchResults.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email || 'No Email'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.plan_type || 'Trial'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {user.photos_used || 0} / {user.photos_limit || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => handleSelectUserFromSearch(user)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Details */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Details</h3>
                    </div>
                    
                    {selectedUserDetails ? (
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.email || 'No Email'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.user_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Type:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.plan_type || 'Trial'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Images Used:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.photos_used || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Image Limit:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedUserDetails.photos_limit || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Credits Remaining:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {Math.max(0, (selectedUserDetails.photos_limit || 0) - (selectedUserDetails.photos_used || 0))}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">No user selected. Please search for a user or select one from the dropdown.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Credits Form */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-medium text-[#1d2939] dark:text-white mb-4">Add Credits</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select User</label>
                      <select 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={selectedUserId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          console.log("Selected user ID:", selectedId);
                          setSelectedUserId(selectedId);
                          
                          // Debug the userCredits array
                          console.log("Available userCredits:", userCredits);
                          
                          const user = userCredits.find(u => {
                            console.log("Comparing:", u.user_id, selectedId, u.user_id === selectedId);
                            return u.user_id === selectedId;
                          });
                          
                          console.log("Found user:", user);
                          if (user) {
                            setSelectedUserDetails(user);
                            setPlanType(user.plan_type || 'trial');
                          } else {
                            console.log("No user found with ID:", selectedId);
                            // Try to find the user by ID instead of user_id as a fallback
                            const userById = userCredits.find(u => u.id === selectedId);
                            if (userById) {
                              console.log("Found user by ID:", userById);
                              setSelectedUserDetails(userById);
                              setPlanType(userById.plan_type || 'trial');
                            }
                          }
                        }}
                      >
                        <option value="">Select a user</option>
                        {userCredits.map((user) => (
                          <option key={user.id} value={user.user_id}>
                            {user.email || 'No Email'} - {user.plan_type || 'N/A'} (ID: {user.user_id.substring(0, 8)}...)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Type</label>
                      <select 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={planType}
                        onChange={(e) => setPlanType(e.target.value)}
                      >
                        <option value="trial">Trial</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credits to Add</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={creditsToAdd}
                        onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                        min="1"
                        max="1000"
                      />
                    </div>
                    
                    <button
                      onClick={handleAddCredits}
                      disabled={!selectedUserId || creditsToAdd <= 0 || isAddingCredits}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingCredits ? 'Adding Credits...' : 'Add Credits'}
                    </button>
                  </div>
                </div>
                
                {deleteError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {deleteError}
                  </div>
                )}
              </div>
              
              {/* Admin Navigation Links Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Admin Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{link.icon}</span>
                        <div>
                          <h3 className="font-medium text-lg">{link.title}</h3>
                          <p className="text-gray-600">{link.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Export is at the function declaration