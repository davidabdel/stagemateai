"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

// Default stats for the admin dashboard
const DEFAULT_STATS = {
  totalUsers: 3,
  trialUsers: 2,
  paidUsers: 1,
  monthlyRevenue: 19,
  totalImagesGenerated: 50
};

// Default user credits for the admin dashboard
const DEFAULT_USER_CREDITS = [
  {
    id: '1',
    user_id: 'e7f4e6da-67a1-4e91-93e-d3ba1daf8df1',
    email: 'david@uconnect.com.au',
    photos_used: 50,
    photos_limit: 3603,
    plan_type: 'trial',
    created_at: '2025-04-07T03:32:43.019Z',
    updated_at: '2025-05-19T22:41:28.34Z'
  },
  {
    id: '2',
    user_id: 'f8c8e1e0-3bf0-4a7a-95fc-1f8c2b4e0790',
    email: 'david@stagemateai.com.au',
    photos_used: 0,
    photos_limit: 53,
    plan_type: 'standard',
    created_at: '2025-04-03T10:33:58.031Z',
    updated_at: '2025-05-07T13:47:15.01Z'
  },
  {
    id: '3',
    user_id: '8d8e7f4e-41f5-48b0-9d7e-3f7ae2bf8d8a',
    email: 'david@mail.com.au',
    photos_used: 0,
    photos_limit: 50,
    plan_type: 'trial',
    created_at: '2025-05-07T09:06:01.0Z',
    updated_at: '2025-05-07T09:06:01.0Z'
  }
];

// Default FAQs for the admin dashboard
const DEFAULT_FAQS = [
  {
    id: '1',
    question: 'How do I create my first image?',
    answer: 'Navigate to the dashboard, click on "Create New Image", upload your product image, and follow the prompts to generate your staged image.'
  },
  {
    id: '2',
    question: 'What file formats are supported?',
    answer: 'We support JPG, PNG, and WEBP formats. For best results, use high-resolution images with clear product visibility.'
  }
];

// Default videos for the admin dashboard
const DEFAULT_VIDEOS = [
  {
    id: '1',
    title: 'Getting Started with StageMate AI',
    description: 'Learn the basics of using StageMate AI to create stunning product images.',
    videoId: 'jO0ILN23L-g',
    thumbnail: 'https://i.ytimg.com/vi/jO0ILN23L-g/mqdefault.jpg'
  },
  {
    id: '2',
    title: 'Dont List an Empty Home',
    description: 'Turn your empty home into a staged home with StageMate AI.',
    videoId: 's_ZeJZx4_n8',
    thumbnail: 'https://i.ytimg.com/vi/s_ZeJZx4_n8/mqdefault.jpg'
  }
];

export default function SimpleAdminDashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [userCredits, setUserCredits] = useState<typeof DEFAULT_USER_CREDITS>(DEFAULT_USER_CREDITS);
  const [faqs, setFaqs] = useState<typeof DEFAULT_FAQS>(DEFAULT_FAQS);
  const [videos, setVideos] = useState<typeof DEFAULT_VIDEOS>(DEFAULT_VIDEOS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<typeof DEFAULT_USER_CREDITS>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle adding credits to a user
  const handleAddCredits = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    
    toast.success(`Added ${creditsToAdd} credits to user`);
  };

  // Search users by email
  const handleSearchUsers = () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email to search');
      return;
    }
    
    setIsSearching(true);
    
    // Filter users by email (case insensitive)
    const results = userCredits.filter(user => 
      user.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
    
    if (results.length === 0) {
      toast.error('No users found with that email');
    } else {
      toast.success(`Found ${results.length} user(s)`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Trial Plan Users</h2>
          <p className="text-3xl font-bold">{stats.trialUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Paid Plan Users</h2>
          <p className="text-3xl font-bold">{stats.paidUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Monthly Revenue</h2>
          <p className="text-3xl font-bold">${stats.monthlyRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Images Generated</h2>
          <p className="text-3xl font-bold">{stats.totalImagesGenerated}</p>
        </div>
      </div>
      
      {/* Manual Credit Management */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Manual Credit Management</h2>
        
        {/* Search Subscribers */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Search Subscribers</h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter user email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleSearchUsers}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>
        
        {/* User Details and Add Credits */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">User Details</h3>
            <p className="text-gray-600 mb-4">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} users matching your search.` 
                : "No user selected. Please search for a user or select one from the dropdown."}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Add Credits</h3>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a user</option>
                  {userCredits.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.email || user.user_id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credits to Add
                </label>
                <input
                  type="number"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type
                </label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <button
                onClick={handleAddCredits}
                disabled={isAddingCredits || !selectedUserId}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingCredits ? 'Adding...' : 'Add Credits'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
