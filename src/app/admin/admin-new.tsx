"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

type UserCredit = {
  id: string;
  user_id: string;
  email?: string;
  display_name?: string; // Added display name field
  photos_used: number;
  photos_limit: number;
  plan_type: string;
  created_at: string;
  updated_at: string;
};

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  totalCreditsUsed: number;
  monthlyRevenue: number;
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [isFixingPlans, setIsFixingPlans] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCreditsUsed: 0,
    monthlyRevenue: 0,
  });
  const [emailToDelete, setEmailToDelete] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      console.log('Fetching user data from API endpoint...');
      
      // Use the debug-users API endpoint that's working correctly
      const response = await fetch('/api/admin/debug-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching users from API:', response.status, errorData);
        toast.error('Failed to load user data');
        return;
      }
      
      const data = await response.json();
      const consolidatedUsers = data.users || [];
      
      console.log('Successfully fetched users from API:', consolidatedUsers);
      console.log('Number of users fetched:', consolidatedUsers.length);
      
      // Debug: Check if we have RLS policies restricting access
      console.log('Current user context:', { userId: useAuth().userId });
      
      // Map the consolidated users data to the UserCredit type
      const mappedUsers = consolidatedUsers?.map((user: any) => ({
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        photos_used: user.photos_used,
        photos_limit: user.photos_limit,
        plan_type: user.plan_type,
        created_at: user.created_at,
        updated_at: user.updated_at,
        // Add any additional fields needed
      })) || [];
      
      console.log('Mapped consolidated users data:', mappedUsers);
      setUserCredits(mappedUsers);
      
      // Log the mapped users to debug
      console.log('Mapped users array:', mappedUsers);
      console.log('Mapped users length:', mappedUsers.length);
      
      // Make sure we're setting the user credits state with the correct data
      setUserCredits(mappedUsers);
      
      // Calculate stats - with extra logging
      console.log('Calculating stats for users...');
      
      // Count users by plan type
      const usersByPlanType: Record<string, number> = {};
      mappedUsers.forEach((user: UserCredit) => {
        const planType = (user.plan_type || 'unknown').toLowerCase();
        usersByPlanType[planType] = (usersByPlanType[planType] || 0) + 1;
      });
      console.log('Users by plan type:', usersByPlanType);
      
      const standardSubscriptions = mappedUsers.filter((user: UserCredit) => 
        (user.plan_type || '').toLowerCase() === 'standard').length || 0;
      const agencySubscriptions = mappedUsers.filter((user: UserCredit) => 
        (user.plan_type || '').toLowerCase() === 'agency').length || 0;
      
      console.log('Standard subscriptions:', standardSubscriptions);
      console.log('Agency subscriptions:', agencySubscriptions);
      
      // Calculate monthly revenue (standard plan: $19/month, agency plan: $49/month)
      const standardRevenue = standardSubscriptions * 19;
      const agencyRevenue = agencySubscriptions * 49;
      const totalMonthlyRevenue = standardRevenue + agencyRevenue;
      
      // Calculate total credits used
      const totalCreditsUsed = mappedUsers.reduce((acc: number, user: UserCredit) => acc + (user.photos_used || 0), 0);
      console.log('Total credits used:', totalCreditsUsed);
      
      const stats = {
        totalUsers: mappedUsers.length,
        activeSubscriptions: standardSubscriptions + agencySubscriptions,
        totalCreditsUsed: totalCreditsUsed,
        monthlyRevenue: totalMonthlyRevenue
      };
      
      console.log('Calculated stats:', stats);
      setStats(stats);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle adding credits to a user
  async function handleAddCredits() {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      toast.error('Please enter a valid number of credits');
      return;
    }
    
    setIsAddingCredits(true);
    try {
      // Find the selected user
      const selectedUser = userCredits.find(user => user.user_id === selectedUserId);
      if (!selectedUser) {
        toast.error('User not found');
        return;
      }
      
      // Calculate the new credits limit
      const newLimit = (selectedUser.photos_limit || 0) + creditsToAdd;
      
      // Update the user's credits in both tables
      // First update user_usage using admin client
      const { error: usageError } = await supabaseAdmin
        .from('user_usage')
        .update({ 
          photos_limit: newLimit,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUserId);
      
      if (usageError) {
        console.error('Error updating credits in user_usage:', usageError);
        toast.error('Failed to update credits in user_usage');
        return;
      }
      
      // Then update consolidated_users using admin client
      const { error: consolidatedError } = await supabaseAdmin
        .from('consolidated_users')
        .update({ 
          photos_limit: newLimit,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUserId);
      
      if (consolidatedError) {
        console.error('Error updating credits in consolidated_users:', consolidatedError);
        toast.error('Failed to update credits in consolidated_users');
        return;
      }
      
      toast.success(`Added ${creditsToAdd} credits to user`);
      
      // Refresh the data
      await fetchData();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    } finally {
      setIsAddingCredits(false);
    }
  };
  
  // Handle fixing plan issues
  const handleFixPlans = async () => {
    try {
      setIsFixingPlans(true);
      
      // Update all free and trial plans to standard in user_usage table
      const { error } = await supabaseAdmin
        .from('user_usage')
        .update({ 
          plan_type: 'standard',
          updated_at: new Date().toISOString()
        })
        .in('plan_type', ['free', 'Free', 'trial', 'Trial']);
      
      if (error) {
        throw error;
      }
      
      // Also update consolidated_users table
      const { error: consolidatedError } = await supabaseAdmin
        .from('consolidated_users')
        .update({ 
          plan_type: 'standard',
          updated_at: new Date().toISOString()
        })
        .in('plan_type', ['free', 'Free', 'trial', 'Trial']);
      
      if (consolidatedError) {
        throw consolidatedError;
      }
      
      toast.success('Successfully fixed plan issues');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error fixing plans:', error);
      toast.error(`Failed to fix plans: ${error.message}`);
    } finally {
      setIsFixingPlans(false);
    }
  };
  
  // Handle deleting a user by email
  const handleDeleteUser = async () => {
    if (!emailToDelete) {
      setDeleteError('Please enter an email address');
      return;
    }
    
    try {
      setIsDeletingUser(true);
      setDeleteError('');
      
      // Call our API endpoint to delete the user
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToDelete }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      toast.success(`Successfully deleted user with email ${emailToDelete}`);
      setEmailToDelete(''); // Clear the input field
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setDeleteError(error.message);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsDeletingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
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
                window.location.href = '/';
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              This will update all "Free" and "Trial" plans to "Standard".
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
                  {userCredits.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.email} {user.display_name ? `(${user.display_name})` : ''} - {user.plan_type} - {Math.max(0, user.photos_limit - user.photos_used)} credits
                    </option>
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
          </div>
          
          {/* User Credits Table */}
          <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">User Credits</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Email</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Display Name</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Used</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Limit</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Credits Remaining</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Plan Type</th>
                  </tr>
                </thead>
                <tbody>
                  {userCredits.map((credit) => (
                    <tr key={credit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.email || 'N/A'}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.display_name || 'N/A'}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.photos_used || 0}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.photos_limit || 0}</td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">
                        {Math.max(0, (credit.photos_limit || 0) - (credit.photos_used || 0))}
                      </td>
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.plan_type || 'Trial'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Delete User Section */}
          <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">Delete User</h3>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">
              Delete a user by their email address. This will remove their data from the application database.
              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                Note: This action cannot be undone. The user will need to sign up again if they want to use the application.
              </span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-3">
                <input
                  type="email"
                  placeholder="Enter user email to delete"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={emailToDelete}
                  onChange={(e) => setEmailToDelete(e.target.value)}
                  disabled={isDeletingUser}
                />
              </div>
              <div>
                <button
                  onClick={handleDeleteUser}
                  disabled={!emailToDelete || isDeletingUser}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingUser ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </button>
              </div>
            </div>
            
            {deleteError && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md mb-4">
                {deleteError}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
              <p className="font-medium">Important:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>This will delete the user's data from the application database.</li>
                <li>The user may still exist in Supabase Auth. For complete removal, you may need to delete them from the Supabase Auth dashboard.</li>
                <li>All user data including credits, usage history, and preferences will be permanently deleted.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
