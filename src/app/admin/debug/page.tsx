"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DebugPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Manual user update states
  const [userId, setUserId] = useState('');
  const [planType, setPlanType] = useState('standard');
  const [creditsToAdd, setCreditsToAdd] = useState(100);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError("");
      
      // Fetch user data directly from our debug endpoint
      const response = await fetch('/api/admin/debug-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error: any) {
      console.error('Error fetching debug data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserPlan() {
    if (!userId) {
      setUpdateMessage('Please enter a user ID');
      return;
    }
    
    setIsLoading(true);
    setUpdateMessage(null);
    
    try {
      // First, get current user data
      const response = await fetch(`/api/admin/user?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      console.log('Current user data:', userData);
      
      if (!userData.user) {
        throw new Error('User not found');
      }
      
      // Calculate new credits
      const currentCredits = userData.user.photos_limit || 0;
      const newCredits = currentCredits + creditsToAdd;
      
      // Update user plan and credits
      const updateResponse = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planType,
          photosLimit: newCredits,
          photosUsed: userData.user.photos_used || 0
        }),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const updateData = await updateResponse.json();
      setUpdateMessage(`Successfully updated user plan to ${planType} and added ${creditsToAdd} credits`);
      
      // Refresh the user list
      fetchData();
    } catch (err: any) {
      setUpdateMessage(`Error: ${err.message}`);
      console.error('Error updating user:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Debug Panel</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Manual User Update Section */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Manual User Update</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="free">Free</option>
                <option value="standard">Standard</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credits to Add</label>
              <input
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={updateUserPlan}
                disabled={isLoading || !userId}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
          {updateMessage && (
            <div className={`mt-4 p-3 rounded ${updateMessage.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {updateMessage}
            </div>
          )}
        </div>
        
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Debug User Data</h1>
            <Link href="/admin" className="text-blue-600 hover:underline">Back to Admin</Link>
          </div>
        </header>
        
        <main>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">User Count: {userData?.count || 0}</h2>
                <button 
                  onClick={fetchData}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Refresh Data
                </button>
              </div>
              
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="mb-4 p-4 flex items-center gap-4">
                  <div>
                    <label htmlFor="sortField" className="block text-sm font-medium text-gray-700 mb-1">Sort By:</label>
                    <select 
                      id="sortField"
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 text-sm"
                    >
                      <option value="created_at">Created Date</option>
                      <option value="email">Email</option>
                      <option value="user_id">User ID</option>
                      <option value="photos_used">Photos Used</option>
                      <option value="photos_limit">Photos Limit</option>
                      <option value="plan_type">Plan Type</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 mb-1">Direction:</label>
                    <select 
                      id="sortDirection"
                      value={sortDirection}
                      onChange={(e) => setSortDirection(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 text-sm"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos Used</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos Limit</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(userData?.users || []).sort((a: any, b: any) => {
                        // Handle different data types for sorting
                        if (sortField === 'created_at') {
                          return sortDirection === 'asc' 
                            ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
                            : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
                        } else if (typeof a[sortField] === 'string') {
                          return sortDirection === 'asc'
                            ? (a[sortField] || '').localeCompare(b[sortField] || '')
                            : (b[sortField] || '').localeCompare(a[sortField] || '');
                        } else {
                          return sortDirection === 'asc'
                            ? (a[sortField] || 0) - (b[sortField] || 0)
                            : (b[sortField] || 0) - (a[sortField] || 0);
                        }
                      }).map((user: any, index: number) => (
                        <tr key={user.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-mono">{user.user_id ? user.user_id.substring(0, 8) + '...' : 'N/A'}</span>
                            <span className="block text-xs text-gray-400">Full: {user.user_id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.photos_used || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.photos_limit || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.plan_type || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-2">Raw Data:</h3>
                  <pre className="p-4 text-xs bg-gray-50 rounded overflow-auto max-h-96">
                    {JSON.stringify(userData?.users || [], null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
