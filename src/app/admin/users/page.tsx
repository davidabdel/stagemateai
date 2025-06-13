"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { checkAuth } from "@/utils/authUtils";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  credits_remaining: number;
  plan_type: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    credits_remaining: 0,
    plan_type: "",
    is_admin: false
  });

  useEffect(() => {
    async function checkAdminAuth() {
      setIsLoading(true);
      const user = await checkAuth();
      
      if (!user) {
        router.push('/auth');
        return;
      }
      
      // Check if user has admin role
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) {
        console.error("Not an admin user:", error);
        router.push('/dashboard');
        return;
      }
      
      setIsAdmin(true);
      fetchUsers();
    }
    
    checkAdminAuth();
  }, [router]);

  async function fetchUsers() {
    try {
      // Get all users from the users table instead of auth.admin.listUsers
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('id, email, created_at');
      
      if (authError) {
        console.error("Error fetching users:", authError);
        setIsLoading(false);
        return;
      }
      
      // Get user credits and plan information
      const { data: userUsage, error: usageError } = await supabase
        .from('user_usage')
        .select('*');
      
      if (usageError && usageError.code !== 'PGRST116') {
        console.error("Error fetching user usage:", usageError);
      }
      
      // Get admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*');
      
      if (adminError && adminError.code !== 'PGRST116') {
        console.error("Error fetching admin users:", adminError);
      }
      
      // Combine data
      const combinedUsers = authUsers?.map(authUser => {
        const usage = userUsage?.find(u => u.user_id === authUser.id);
        const isAdmin = adminUsers?.some(admin => admin.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: null, // This info is not available from the users table
          is_admin: isAdmin || false,
          credits_remaining: usage?.credits_remaining || 0,
          plan_type: usage?.plan_type || 'free'
        };
      }) || [];
      
      setUsers(combinedUsers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  }

  function handleEditUser(user: User) {
    setSelectedUser(user);
    setEditForm({
      credits_remaining: user.credits_remaining,
      plan_type: user.plan_type,
      is_admin: user.is_admin
    });
    setIsEditing(true);
  }

  async function handleSaveUser() {
    if (!selectedUser) return;
    
    try {
      // Update user credits and plan
      const { error: usageError } = await supabase
        .from('user_usage')
        .update({
          credits_remaining: editForm.credits_remaining,
          plan_type: editForm.plan_type
        })
        .eq('user_id', selectedUser.id);
      
      if (usageError) throw usageError;
      
      // Handle admin status
      if (editForm.is_admin && !selectedUser.is_admin) {
        // Add admin role
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert([{ user_id: selectedUser.id }]);
        
        if (adminError) throw adminError;
      } else if (!editForm.is_admin && selectedUser.is_admin) {
        // Remove admin role
        const { error: adminError } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', selectedUser.id);
        
        if (adminError) throw adminError;
      }
      
      // Refresh user list
      await fetchUsers();
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan_type === filterPlan;
    return matchesSearch && matchesPlan;
  });

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
            <Link href="/admin" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Dashboard
            </Link>
            <Link href="/admin/analytics" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Analytics
            </Link>
            <Link href="/admin/subscriptions" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Subscriptions
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white">User Management</h2>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Search by email..." 
                className="w-full sm:w-80 bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <select 
                className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm"
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="bg-white dark:bg-[#18181b] rounded-xl overflow-x-auto shadow-md">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#18181b] divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.plan_type === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        user.plan_type === 'basic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        user.plan_type === 'pro' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.credits_remaining}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.is_admin ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-[#2563eb] hover:text-[#1e40af]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#1d2939] dark:text-white mb-4">Edit User</h3>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">{selectedUser.email}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  className="w-full bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2"
                  value={editForm.credits_remaining}
                  onChange={(e) => setEditForm({...editForm, credits_remaining: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Plan Type
                </label>
                <select
                  className="w-full bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2"
                  value={editForm.plan_type}
                  onChange={(e) => setEditForm({...editForm, plan_type: e.target.value})}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  className="h-4 w-4 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({...editForm, is_admin: e.target.checked})}
                />
                <label htmlFor="is_admin" className="ml-2 block text-sm text-[#1d2939] dark:text-white">
                  Admin Access
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-[#1d2939] dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1e40af] text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
