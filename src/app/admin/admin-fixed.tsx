"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// Default video tutorials in case database fetch fails
const defaultVideoTutorials = [
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

// Default FAQ items in case database fetch fails
const defaultFaqItems = [
  {
    id: '1',
    question: 'How do I create my first image?',
    answer: 'Navigate to the dashboard, click on "Create New Image", upload your product image, and follow the prompts to generate your staged image.'
  },
  {
    id: '2',
    question: 'What file formats are supported?',
    answer: 'We support JPG, PNG, and WEBP formats. For best results, use high-resolution images with clear product visibility.'
  },
  {
    id: '3',
    question: 'How many credits do I need per image?',
    answer: 'Each image generation uses 1 credit. The number of credits you have depends on your subscription plan.'
  }
];

type UserCredit = {
  id: string;
  user_id: string;
  email?: string;
  photos_used?: number;
  photos_limit?: number;
  plan_type?: string;
  created_at?: string;
  updated_at?: string;
};

type Stats = {
  totalUsers: number;
  trialUsers: number;
  paidUsers: number;
  monthlyRevenue: number;
  totalImagesGenerated: number;
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserCredit | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 3,
    trialUsers: 2,
    paidUsers: 1,
    monthlyRevenue: 19,
    totalImagesGenerated: 50,
  });
  const [videos, setVideos] = useState(defaultVideoTutorials);
  const [faqs, setFaqs] = useState(defaultFaqItems);

  useEffect(() => {
    fetchData();
    fetchVideos();
    fetchFaqs();
  }, []);

  // Fetch videos from API
  async function fetchVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching videos:', error);
        setVideos(defaultVideoTutorials);
      } else if (data && data.length > 0) {
        setVideos(data);
      } else {
        setVideos(defaultVideoTutorials);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos(defaultVideoTutorials);
    }
  }

  // Fetch FAQs from API
  async function fetchFaqs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs(defaultFaqItems);
      } else if (data && data.length > 0) {
        setFaqs(data);
      } else {
        setFaqs(defaultFaqItems);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs(defaultFaqItems);
    }
  }

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Fetch user credits from Supabase
      const { data, error } = await supabase
        .from('user_credits')
        .select('*');
      
      if (error) {
        console.error('Error fetching user credits:', error);
        toast.error('Failed to fetch user data');
      } else if (data && data.length > 0) {
        setUserCredits(data);
      }
      
      // Use mock data if no real data is available
      if (!data || data.length === 0) {
        const mockUsers = [
          {
            id: '1',
            user_id: 'e7f4e6da-67a1-4e91-93e-d3ba1daf8df1',
            email: 'david@uconnect.com.au',
            photos_limit: 3603,
            plan_type: 'trial',
            created_at: '2025-04-07T03:32:43.019Z',
            updated_at: '2025-05-19T22:41:28.34Z'
          },
          {
            id: '2',
            user_id: 'f8c8e1e0-3bf0-4a7a-95fc-1f8c2b4e0790',
            email: 'david@stagemateai.com.au',
            photos_limit: 53,
            plan_type: 'standard',
            created_at: '2025-04-03T10:33:58.031Z',
            updated_at: '2025-05-07T13:47:15.01Z'
          },
          {
            id: '3',
            user_id: '8d8e7f4e-41f5-48b0-9d7e-3f7ae2bf8d8a',
            email: 'david@mail.com.au',
            photos_limit: 50,
            plan_type: 'trial',
            created_at: '2025-05-07T09:06:01.0Z',
            updated_at: '2025-05-07T09:06:01.0Z'
          }
        ];
        setUserCredits(mockUsers);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    const user = userCredits.find(u => u.user_id === userId);
    setSelectedUserId(userId);
    setSelectedUserDetails(user || null);
  };

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
      toast.loading('Adding credits...');
      
      // Find the user in our data
      const userIndex = userCredits.findIndex(user => user.user_id === selectedUserId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Get the current user
      const currentUser = userCredits[userIndex];
      
      if (!currentUser.email) {
        throw new Error('User email not found');
      }
      
      // Use our dedicated API endpoint to update credits
      const response = await fetch('/api/admin/update-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          credits: creditsToAdd,
          planType: planType
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.message || response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Unknown error updating credits');
      }
      
      // Calculate new limit based on API response
      const newLimit = result.after.credits;
      
      // Create updated user object for local state
      const updatedUser = {
        ...currentUser,
        photos_limit: newLimit,
        plan_type: result.after.plan || planType,
        updated_at: new Date().toISOString()
      };
      
      // Update the user in our local state
      const updatedUserCredits = [...userCredits];
      updatedUserCredits[userIndex] = updatedUser;
      
      // Update state
      setUserCredits(updatedUserCredits);
      
      // Update selected user details if this is the currently selected user
      if (selectedUserDetails && selectedUserDetails.user_id === selectedUserId) {
        setSelectedUserDetails(updatedUser);
      }
      
      toast.dismiss();
      toast.success(`Added ${creditsToAdd} credits to user. Previous: ${result.before.credits}, New: ${result.after.credits}`);
      
      // Refresh data to ensure we have the latest from the database
      fetchData();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.dismiss();
      toast.error(`Failed to add credits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAddingCredits(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Back to Home
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Trial Plan Users</h3>
            <p className="text-3xl font-bold">{stats.trialUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Paid Plan Users</h3>
            <p className="text-3xl font-bold">{stats.paidUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold">${stats.monthlyRevenue}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Total Images Generated</h3>
            <p className="text-3xl font-bold">{stats.totalImagesGenerated}</p>
          </div>
        </div>

        {/* Manual Credit Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Manual Credit Management</h2>
          
          {/* Search Subscribers */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Search Subscribers</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Email
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={selectedUserDetails?.email || ''}
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                  placeholder="Enter user email"
                  disabled
                />
                <button
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">User Details</h3>
              {selectedUserDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium">{selectedUserDetails.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedUserDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credits</p>
                    <p className="font-medium">{selectedUserDetails.photos_limit || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan Type</p>
                    <p className="font-medium">{selectedUserDetails.plan_type || 'standard'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {selectedUserDetails.updated_at
                        ? new Date(selectedUserDetails.updated_at).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No user selected. Please search for a user or select one from the dropdown.</p>
              )}
            </div>
            
            {/* Add Credits */}
            <div>
              <h3 className="text-lg font-medium mb-4">Add Credits</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleUserSelect(e.target.value)}
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