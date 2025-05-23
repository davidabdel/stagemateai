'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';

// Define types for videos and FAQs
interface Video {
  id: string;
  title: string;
  description: string;
  videoId: string;
  thumbnail: string;
  created_at?: string;
  updated_at?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}

// Define user credit type
interface UserCredit {
  user_id: string;
  email: string;
  photos_limit: number;
  plan_type: string;
  updated_at: string;
  [key: string]: any; // For any other properties
}

// Default FAQ items in case database fetch fails
const defaultFaqItems: FAQ[] = [
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
  },
  {
    id: '4',
    question: 'Can I upgrade my plan?',
    answer: 'Yes! You can upgrade your plan at any time from the dashboard by clicking on "Upgrade" in the top right corner.'
  },
  {
    id: '5',
    question: 'How do I download my images?',
    answer: 'Your generated images will appear in your dashboard. Click on any image and use the download button to save it to your device.'
  },
  {
    id: '6',
    question: 'What if I run out of credits?',
    answer: 'You can purchase additional credits or upgrade your plan to get more credits. Visit the dashboard and click on "Get More Credits".'
  }
];

// Default video tutorials in case database fetch fails
const defaultVideoTutorials: Video[] = [
  {
    id: '1',
    title: 'Getting Started with StageMate AI',
    description: 'Learn the basics of using StageMate AI to create stunning product images.',
    videoId: 'jO0ILN23L-g', // Replace with your actual YouTube video ID
    thumbnail: 'https://i9.ytimg.com/vi/jO0ILN23L-g/mqdefault.jpg?sqp=CKDUgMEG-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBogNyh_MA8=&rs=AOn4CLBWg5O4NBRRpwZhkIRzi6sSi7SneA' // Replace with your actual thumbnail path
  },
  {
    id: '2',
    title: 'Dont List an Empty Home',
    description: 'Turn your empty home into a staged home with StageMate AI.',
    videoId: 's_ZeJZx4_n8', // Replace with your actual YouTube video ID
    thumbnail: 'https://i9.ytimg.com/vi/s_ZeJZx4_n8/mqdefault.jpg?sqp=CKDUgMEG-oaymwEmCMACELQB8quKqQMa8AEB-AHwB4AC0AWKAgwIABABGGUgWyhEMA8=&rs=AOn4CLCEqM3klHLeBpjiJUdDJT5zBgwFVg' // Replace with your actual thumbnail path
  }
];

export default function AdminDashboard() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserCredit | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Fetch user credits from Supabase
      const { data: userCreditsData, error: userCreditsError } = await supabase
        .from('user_credits')
        .select('*');
      
      if (userCreditsError) {
        console.error('Error fetching user credits:', userCreditsError);
        toast.error('Failed to fetch user data');
        return;
      }
      
      // Make sure we have valid data
      if (userCreditsData && userCreditsData.length > 0) {
        setUserCredits(userCreditsData);
        setTotalUsers(userCreditsData.length);
        
        // Calculate total credits across all users
        const totalCreditsSum = userCreditsData.reduce((sum, user) => sum + (user.photos_limit || 0), 0);
        setTotalCredits(totalCreditsSum);
        
        // Set first user as selected by default if none is selected
        if (!selectedUserId && userCreditsData.length > 0) {
          setSelectedUserId(userCreditsData[0].user_id);
          setSelectedUserDetails(userCreditsData[0]);
        }
      } else {
        console.log('No user credits data found');
        toast.error('No user data found');
      }
      
      // Fetch total images
      const { count: imagesCount, error: imagesError } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true });
      
      if (imagesError) {
        console.error('Error fetching images count:', imagesError);
      } else {
        setTotalImages(imagesCount || 0);
      }
      
      // Fetch videos and FAQs
      await fetchVideos();
      await fetchFaqs();
      
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch videos from API
  async function fetchVideos() {
    try {
      // Try to fetch from Supabase directly first
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('id', { ascending: true });
      
      if (videosError) {
        console.error('Error fetching videos from Supabase:', videosError);
        // Fall back to default videos
        console.log('Using default videos instead');
        setVideos(defaultVideoTutorials);
        return;
      }
      
      if (videosData && videosData.length > 0) {
        setVideos(videosData as Video[]);
      } else {
        // No data in Supabase, use defaults
        console.log('No videos found in Supabase, using defaults');
        setVideos(defaultVideoTutorials);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Fall back to default videos
      setVideos(defaultVideoTutorials);
    }
  }

  // Fetch FAQs from API
  async function fetchFaqs() {
    try {
      // Try to fetch from Supabase directly first
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('*')
        .order('id', { ascending: true });
      
      if (faqsError) {
        console.error('Error fetching FAQs from Supabase:', faqsError);
        // Fall back to default FAQs
        console.log('Using default FAQs instead');
        setFaqs(defaultFaqItems);
        return;
      }
      
      if (faqsData && faqsData.length > 0) {
        setFaqs(faqsData as FAQ[]);
      } else {
        // No data in Supabase, use defaults
        console.log('No FAQs found in Supabase, using defaults');
        setFaqs(defaultFaqItems);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Fall back to default FAQs
      setFaqs(defaultFaqItems);
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
      
      console.log('Using dedicated API endpoint to update credits for:', currentUser.email);
      
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
      console.log('API response:', result);
      
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

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Images</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalImages}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Credits</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCredits}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Video Tutorials
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'faqs'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                FAQs
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User List */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Users</h3>
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : userCredits.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {userCredits.map((user) => (
                          <button
                            key={user.user_id}
                            onClick={() => handleUserSelect(user.user_id)}
                            className={`w-full text-left p-3 rounded-md ${
                              selectedUserId === user.user_id
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <p className="font-medium text-gray-900 dark:text-white">{user.email || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Credits: {user.photos_limit || 0} | Plan: {user.plan_type || 'standard'}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    )}
                  </div>

                  {/* User Details */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Details</h3>
                    {selectedUserDetails ? (
                      <div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedUserDetails.user_id}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedUserDetails.email || 'Unknown'}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Credits</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedUserDetails.photos_limit || 0}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Plan Type</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedUserDetails.plan_type || 'standard'}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedUserDetails.updated_at
                              ? new Date(selectedUserDetails.updated_at).toLocaleString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Select a user to view details</p>
                    )}
                  </div>

                  {/* Add Credits */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Credits</h3>
                    {selectedUserDetails ? (
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Credits to Add
                          </label>
                          <input
                            type="number"
                            value={creditsToAdd}
                            onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Plan Type
                          </label>
                          <select
                            value={planType}
                            onChange={(e) => setPlanType(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                        <button
                          onClick={handleAddCredits}
                          disabled={isAddingCredits}
                          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingCredits ? 'Adding...' : 'Add Credits'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Select a user to add credits</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video Tutorials Tab */}
            {activeTab === 'videos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Video Tutorials</h3>
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map((video) => (
                      <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{video.title}</h4>
                          <p className="text-gray-500 dark:text-gray-400">{video.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                        <p className="text-gray-500 dark:text-gray-400">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}