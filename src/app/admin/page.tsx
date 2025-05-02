"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// Define types for our data structures
interface User {
  id: string;
  email: string;
}

interface UserCredit {
  id: string;
  user_id: string;
  photos_used: number;
  photos_limit: number;
  plan_type: string;
  created_at: string;
  updated_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalListings: number;
  totalCreditsUsed: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalListings: 0,
    totalCreditsUsed: 0,
    monthlyRevenue: 0,
  });
  
  const [usersData, setUsersData] = useState<User[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [isFixingPlans, setIsFixingPlans] = useState(false);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserCredit[]>([]);
  const [selectedUserCredit, setSelectedUserCredit] = useState<UserCredit | null>(null);

  useEffect(() => {
    async function checkAdminAuth() {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        router.push('/auth');
        return;
      }
      
      const currentUser = session.user;
      setUser({
        id: currentUser.id,
        email: currentUser.email || 'Unknown email'
      });
      
      // Check if user has admin role
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      if (error || !data) {
        console.error("Not an admin user:", error);
        router.push('/dashboard'); // Redirect non-admin users to regular dashboard
        return;
      }
      
      setIsAdmin(true);
      fetchAdminData();
    }
    
    checkAdminAuth();
  }, [router]);

  async function fetchAdminData() {
    try {
      setIsLoading(true);
      
      // Fetch users data
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      
      if (usersData.success) {
        setUsersData(usersData.users || []);
      }
      
      // Fetch user credits data
      const creditsResponse = await fetch('/api/admin/user-credits');
      const creditsData = await creditsResponse.json();
      
      if (creditsData.success) {
        setUserCredits(creditsData.userCredits || []);
      }
      
      // Calculate some basic stats
      const stats = {
        totalUsers: usersData.users?.length || 0,
        activeSubscriptions: creditsData.userCredits?.filter((uc: UserCredit) => 
          uc.plan_type === 'standard' || uc.plan_type === 'agency').length || 0,
        totalListings: 0, // Would need another API call
        totalCreditsUsed: creditsData.userCredits?.reduce((acc: number, curr: UserCredit) => 
          acc + (curr.photos_used || 0), 0) || 0,
        monthlyRevenue: 0, // Would need Stripe data
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle adding credits to a user
  const handleAddCredits = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      toast.error('Please enter a valid number of credits');
      return;
    }
    
    try {
      setIsAddingCredits(true);
      
      const response = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          credits: creditsToAdd,
          planType: planType
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully added ${creditsToAdd} credits to user`);
        // Refresh user credits
        fetchAdminData();
      } else {
        toast.error(`Failed to add credits: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits. Please try again.');
    } finally {
      setIsAddingCredits(false);
    }
  };
  
  // Handle fixing plan issues
  const handleFixPlans = async () => {
    try {
      setIsFixingPlans(true);
      
      const response = await fetch('/api/admin/fix-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully fixed plan issues');
        // Refresh user credits
        fetchAdminData();
      } else {
        toast.error(`Failed to fix plans: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fixing plans:', error);
      toast.error('Failed to fix plans. Please try again.');
    } finally {
      setIsFixingPlans(false);
    }
  };

  // Handle searching for users
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = userCredits.filter(credit => 
      credit.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // Handle selecting a user from search results
  const handleSelectUser = (userCredit: UserCredit) => {
    setSelectedUserCredit(userCredit);
    setSelectedUserId(userCredit.user_id);
    setSearchResults([]);
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <Toaster position="top-right" />
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center">
            <img 
              src="/images/3.png" 
              alt="StageMate Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
            <span className="ml-2 text-xl font-bold text-[#1d2939] dark:text-white">Admin</span>
          </Link>
          <nav className="flex items-center">
            <Link href="/dashboard" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              User Dashboard
            </Link>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
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
          <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white mb-6">Admin Dashboard</h2>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Total Users</h3>
              <p className="text-2xl font-bold text-[#1d2939] dark:text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Active Subscriptions</h3>
              <p className="text-2xl font-bold text-[#1d2939] dark:text-white">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Total Credits Used</h3>
              <p className="text-2xl font-bold text-[#1d2939] dark:text-white">{stats.totalCreditsUsed}</p>
            </div>
            <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-[#1d2939] dark:text-white">${stats.monthlyRevenue}</p>
            </div>
          </div>
          
          {/* Fix Plans Button */}
          <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">Fix Plan Issues</h3>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">
              This will deactivate all "Free" and "Trial" plans and update users with those plan types to "Standard".
            </p>
            <button
              onClick={handleFixPlans}
              disabled={isFixingPlans}
              className="bg-[#2563eb] hover:bg-[#1e40af] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFixingPlans ? 'Fixing Plans...' : 'Fix Plans'}
            </button>
          </div>
          
          {/* User Credits Management Section */}
          <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">Manage User Credits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select User</label>
                <select 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a user</option>
                  {usersData.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credits to Add</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Type</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            
            <button
              onClick={handleAddCredits}
              disabled={!selectedUserId || creditsToAdd <= 0 || isAddingCredits}
              className="bg-[#2563eb] hover:bg-[#1e40af] text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingCredits ? 'Adding Credits...' : 'Add Credits'}
            </button>
            
            {/* Search for users */}
            <div className="mt-8">
              <h4 className="text-lg font-medium text-[#1d2939] dark:text-white mb-2">Search Users</h4>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter user ID"
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md shadow-sm text-[#1d2939] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim()}
                  className="bg-[#2563eb] hover:bg-[#1e40af] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Search
                </button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-md p-4 max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-2 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">User ID</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Used</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Limit</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Plan</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((userCredit) => (
                        <tr key={userCredit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-2 px-2 text-sm text-[#1d2939] dark:text-white">{userCredit.user_id}</td>
                          <td className="py-2 px-2 text-sm text-[#1d2939] dark:text-white">{userCredit.photos_used || 0}</td>
                          <td className="py-2 px-2 text-sm text-[#1d2939] dark:text-white">{userCredit.photos_limit || 0}</td>
                          <td className="py-2 px-2 text-sm text-[#1d2939] dark:text-white">{userCredit.plan_type || 'Trial'}</td>
                          <td className="py-2 px-2">
                            <button
                              onClick={() => handleSelectUser(userCredit)}
                              className="text-[#2563eb] hover:text-[#1e40af] font-medium"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* User Credits Table */}
          <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">User Credits</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">User ID</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Used</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Limit</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Plan Type</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Created At</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {userCredits.map((credit) => (
                    <tr key={credit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.user_id}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.photos_used || 0}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.photos_limit || 0}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.plan_type || 'Trial'}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">
                        {new Date(credit.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">
                        {new Date(credit.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
