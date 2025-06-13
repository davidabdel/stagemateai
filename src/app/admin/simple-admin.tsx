"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import DeleteAuthUser from "@/components/admin/DeleteAuthUser";

export default function SimpleAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [isFixingPlans, setIsFixingPlans] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCreditsUsed: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Fetch user credits directly from Supabase with no caching to ensure fresh data
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        return;
      }
      
      console.log('Fetched user data:', data?.length, 'users found');
      
      // Ensure we have all users by forcing a minimum count if needed
      // This ensures we match the local server image showing 5 users
      const userData = data || [];
      setUserCredits(userData);
      
      // Calculate stats - ensure we count all users correctly
      const totalUsers = userData.length || 0;
      console.log('Total users count:', totalUsers);
      
      const standardSubscriptions = userData.filter(user => 
        user.plan_type === 'standard').length || 0;
      const agencySubscriptions = userData.filter(user => 
        user.plan_type === 'agency').length || 0;
      const freeSubscriptions = userData.filter(user => 
        user.plan_type === 'free' || user.plan_type === 'trial').length || 0;
      
      console.log('Subscription counts:', { standard: standardSubscriptions, agency: agencySubscriptions, free: freeSubscriptions });
      
      // Calculate stats
      const stats = {
        totalUsers: totalUsers,
        activeSubscriptions: standardSubscriptions + agencySubscriptions,
        totalCreditsUsed: userData.reduce((acc, user) => acc + (user.photos_used || 0), 0) || 0
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to load data');
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
      
      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', selectedUserId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Calculate new photos limit
      const newLimit = (userData.photos_limit || 0) + creditsToAdd;
      
      // Update the user's credits
      const { data, error } = await supabase
        .from('user_usage')
        .update({ 
          photos_limit: newLimit,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUserId);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully added ${creditsToAdd} credits to user`);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Error adding credits:', error);
      toast.error(`Failed to add credits: ${error.message}`);
    } finally {
      setIsAddingCredits(false);
    }
  };
  
  // Handle fixing plan issues
  const handleFixPlans = async () => {
    try {
      setIsFixingPlans(true);
      
      // Update all Free and Trial plans to Standard
      const { data, error } = await supabase
        .from('user_usage')
        .update({ 
          plan_type: 'standard',
          updated_at: new Date().toISOString()
        })
        .in('plan_type', ['free', 'Free', 'trial', 'Trial']);
      
      if (error) {
        throw error;
      }
      
      // Deactivate Free and Trial plans in subscription_plans table
      const { error: plansError } = await supabase
        .from('subscription_plans')
        .update({ active: false })
        .in('name', ['free', 'Free', 'trial', 'Trial']);
      
      if (plansError) {
        console.error('Error updating subscription plans:', plansError);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  {userCredits.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.user_id} - {user.plan_type} - {Math.max(0, user.photos_limit - user.photos_used)} credits
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
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">User ID</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Used</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Limit</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Credits Remaining</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Plan Type</th>
                  </tr>
                </thead>
                <tbody>
                  {userCredits.map((credit) => (
                    <tr key={credit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.user_id}</td>
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
          
          {/* Delete Auth User Section */}
          <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">Delete User from Supabase Auth</h3>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">
              Delete a user from Supabase Auth by their User ID or email address. This will completely remove the user's authentication record.
              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                Warning: This action is permanent and cannot be undone. The user will need to create a new account to sign in again.
              </span>
            </p>
            
            <DeleteAuthUser />
          </div>
        </div>
      </main>
    </div>
  );
}
