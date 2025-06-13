"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

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

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  totalCreditsUsed: number;
  monthlyRevenue: number;
};

type Video = {
  id: string;
  title: string;
  description: string;
  videoId: string;
  thumbnail: string;
  created_at?: string;
  updated_at?: string;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
};

// Error Boundary Component for client components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// AdminSection component with error boundary
function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-red-600">{title} - Error</h3>
          <p className="text-red-500">This section encountered an error and couldn't be displayed.</p>
        </div>
      }
    >
      <div className="p-4 bg-white border rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <Suspense fallback={<div className="animate-pulse">Loading {title.toLowerCase()}...</div>}>
          {children}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditsToAdd, setCreditsToAdd] = useState(50);
  const [planType, setPlanType] = useState('standard');
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCreditsUsed: 0,
    monthlyRevenue: 0,
  });
  const [emailToDelete, setEmailToDelete] = useState('');
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoId, setVideoId] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  
  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [selectedFaqId, setSelectedFaqId] = useState('');
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [isEditingFaq, setIsEditingFaq] = useState(false);
  const [isDeletingFaq, setIsDeletingFaq] = useState(false);

  useEffect(() => {
    fetchData();
    fetchVideos();
    fetchFaqs();
  }, []);
  
  // Fetch videos from API
  async function fetchVideos() {
    try {
      const response = await fetch('/api/admin/videos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching videos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    }
  }

  // Fetch FAQs from API
  async function fetchFaqs() {
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching FAQs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    }
  }

  async function fetchData() {
    try {
      setIsLoading(true);
      console.log('Fetching user data from Supabase...');
      
      // Fetch user credits directly from Supabase
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usageError) {
        console.error('Error fetching usage data:', usageError);
        toast.error('Failed to load usage data');
        return;
      }
      
      console.log('Successfully fetched usage data:', usageData?.length, 'users found');
      
      // Fetch user emails - with error handling
      let emailData: Record<string, string> = {};
      try {
        console.log('Attempting to fetch user emails from API...');
        const emailResponse = await fetch('/api/admin/user-emails', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Email response status:', emailResponse.status);
        
        if (emailResponse.ok) {
          const emailsJson = await emailResponse.json();
          
          if (emailsJson.users && Array.isArray(emailsJson.users)) {
            emailsJson.users.forEach((user: {id: string, email: string}) => {
              if (user.id && user.email) {
                emailData[user.id] = user.email;
              }
            });
          }
        } else {
          console.warn('Email API returned status:', emailResponse.status);
        }
      } catch (emailError) {
        console.error('Error fetching email data:', emailError);
      }
      
      // Hardcoded email mappings for known users
      const knownEmails: Record<string, string> = {
        '8b5fe1': 'david@uconnect.com.au',  // Admin user
        'e745a6': 'davidnvr28@gmail.com',   // Regular user
      };
      
      // Process user data with emails
      const usersWithEmails = usageData?.map(user => {
        const userId = user.user_id;
        const shortId = userId ? userId.substring(0, 6) : '';
        
        // If email is already in the database, use it
        if (user.email) {
          return user;
        }
        
        // Use known email if available, then try API data, then fallback to placeholder
        let email = knownEmails[shortId] || emailData[userId];
        
        // If still no email, use a consistent domain based on user ID
        if (!email) {
          const domain = shortId === '8b5fe1' ? 'uconnect.com.au' : 'stagemateai.com';
          email = `${shortId}@${domain}`;
        }
        
        // Override specific emails for demo purposes if needed
        if (shortId === '8b5fe1') {
          email = 'david@uconnect.com.au';
        } else if (shortId === 'e745a6') {
          email = 'davidnvr28@gmail.com';
        }
        
        return {
          ...user,
          email: email
        };
      }) || [];
      
      setUserCredits(usersWithEmails);
      
      // Calculate stats
      const totalUsers = usersWithEmails.length || 0;
      
      const standardSubscriptions = usersWithEmails.filter(user => 
        user.plan_type === 'standard').length || 0;
      const agencySubscriptions = usersWithEmails.filter(user => 
        user.plan_type === 'agency').length || 0;
      
      // Calculate monthly revenue (standard plan: $19/month, agency plan: $49/month)
      const standardRevenue = standardSubscriptions * 19;
      const agencyRevenue = agencySubscriptions * 49;
      const totalMonthlyRevenue = standardRevenue + agencyRevenue;
      
      const stats = {
        totalUsers: totalUsers,
        activeSubscriptions: standardSubscriptions + agencySubscriptions,
        totalCreditsUsed: usersWithEmails.reduce((acc, user) => acc + (user.photos_used || 0), 0) || 0,
        monthlyRevenue: totalMonthlyRevenue
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
      
      // Calculate new limit
      const currentLimit = userData?.photos_limit || 0;
      const newLimit = currentLimit + creditsToAdd;
      
      // Update plan type if needed
      const newPlanType = planType;
      
      // Update user credits
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({ 
          photos_limit: newLimit,
          plan_type: newPlanType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUserId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success(`Added ${creditsToAdd} credits to user`);
      fetchData();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    } finally {
      setIsAddingCredits(false);
    }
  };

  // Handle adding a new video
  const handleAddVideo = async () => {
    if (!videoTitle || !videoId) {
      toast.error('Title and YouTube Video ID are required');
      return;
    }
    
    try {
      setIsAddingVideo(true);
      
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: videoTitle,
          description: videoDescription,
          videoId: videoId,
          thumbnail: `/images/video-thumbnail-${videos.length + 1}.jpg`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error adding video: ${response.status} ${response.statusText}`);
      }
      
      toast.success('Video added successfully');
      
      // Reset form
      setVideoTitle('');
      setVideoDescription('');
      setVideoId('');
      
      // Refresh videos
      fetchVideos();
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video');
    } finally {
      setIsAddingVideo(false);
    }
  };
  
  // Handle editing a video
  const handleEditVideo = async () => {
    if (!selectedVideoId || !videoTitle || !videoId) {
      toast.error('Please select a video and fill in all required fields');
      return;
    }
    
    try {
      setIsEditingVideo(true);
      
      const response = await fetch(`/api/admin/videos/${selectedVideoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: videoTitle,
          description: videoDescription,
          videoId: videoId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error updating video: ${response.status} ${response.statusText}`);
      }
      
      toast.success('Video updated successfully');
      
      // Reset form
      setSelectedVideoId('');
      setVideoTitle('');
      setVideoDescription('');
      setVideoId('');
      
      // Refresh videos
      fetchVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    } finally {
      setIsEditingVideo(false);
    }
  };
  
  // Handle deleting a video
  const handleDeleteVideo = async (id: string) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      setIsDeletingVideo(true);
      
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting video: ${response.status} ${response.statusText}`);
      }
      
      toast.success('Video deleted successfully');
      
      // Refresh videos
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setIsDeletingVideo(false);
    }
  };
  
  // Handle selecting a video for editing
  const handleSelectVideo = (video: Video) => {
    setSelectedVideoId(video.id);
    setVideoTitle(video.title);
    setVideoDescription(video.description || '');
    setVideoId(video.videoId);
  };

  // Handle adding a new FAQ
  const handleAddFaq = async () => {
    if (!faqQuestion || !faqAnswer) {
      toast.error('Question and answer are required');
      return;
    }
    
    try {
      setIsAddingFaq(true);
      
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: faqQuestion,
          answer: faqAnswer
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error adding FAQ: ${response.status} ${response.statusText}`);
      }
      
      toast.success('FAQ added successfully');
      
      // Reset form
      setFaqQuestion('');
      setFaqAnswer('');
      
      // Refresh FAQs
      fetchFaqs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error('Failed to add FAQ');
    } finally {
      setIsAddingFaq(false);
    }
  };
  
  // Handle editing a FAQ
  const handleEditFaq = async () => {
    if (!selectedFaqId || !faqQuestion || !faqAnswer) {
      toast.error('Please select a FAQ and fill in all required fields');
      return;
    }
    
    try {
      setIsEditingFaq(true);
      
      const response = await fetch(`/api/admin/faqs/${selectedFaqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: faqQuestion,
          answer: faqAnswer
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error updating FAQ: ${response.status} ${response.statusText}`);
      }
      
      toast.success('FAQ updated successfully');
      
      // Reset form
      setSelectedFaqId('');
      setFaqQuestion('');
      setFaqAnswer('');
      
      // Refresh FAQs
      fetchFaqs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    } finally {
      setIsEditingFaq(false);
    }
  };
  
  // Handle deleting a FAQ
  const handleDeleteFaq = async (id: string) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    
    try {
      setIsDeletingFaq(true);
      
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting FAQ: ${response.status} ${response.statusText}`);
      }
      
      toast.success('FAQ deleted successfully');
      
      // Refresh FAQs
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    } finally {
      setIsDeletingFaq(false);
    }
  };
  
  // Handle selecting a FAQ for editing
  const handleSelectFaq = (faq: FAQ) => {
    setSelectedFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
  };
  
  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!emailToDelete) {
      setDeleteError('Please enter an email address');
      return;
    }
    
    try {
      setIsDeletingUser(true);
      setDeleteError('');
      
      // Find user by email
      const { data: users, error: fetchError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('email', emailToDelete);
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!users || users.length === 0) {
        setDeleteError('User not found');
        return;
      }
      
      // Delete user
      const { error: deleteError } = await supabase
        .from('user_usage')
        .delete()
        .eq('email', emailToDelete);
      
      if (deleteError) {
        throw deleteError;
      }
      
      toast.success(`Deleted user ${emailToDelete}`);
      setEmailToDelete('');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteError('Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#1d2939] dark:text-white">Admin Dashboard</h1>
            <Link href="/" className="text-[#2563eb] hover:underline">Back to Home</Link>
          </div>
        </header>
        
        <main>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
            </div>
          ) : (
            <ErrorBoundary
              fallback={
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-red-600">Dashboard Error</h3>
                  <p className="text-red-500">There was an error loading the admin dashboard. Please try refreshing the page.</p>
                </div>
              }
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Suspense fallback={<div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-24"></div>}>
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                    <p className="text-3xl font-bold text-[#1d2939] dark:text-white">{stats.totalUsers}</p>
                  </div>
                </Suspense>
                
                <Suspense fallback={<div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-24"></div>}>
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Active Subscriptions</h3>
                    <p className="text-3xl font-bold text-[#1d2939] dark:text-white">{stats.activeSubscriptions}</p>
                  </div>
                </Suspense>
                
                <Suspense fallback={<div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-24"></div>}>
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Credits Used</h3>
                    <p className="text-3xl font-bold text-[#1d2939] dark:text-white">{stats.totalCreditsUsed}</p>
                  </div>
                </Suspense>
                
                <Suspense fallback={<div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-24"></div>}>
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-[#1d2939] dark:text-white">${stats.monthlyRevenue}</p>
                  </div>
                </Suspense>
              </div>
              
              {/* Add Credits Form */}
              <AdminSection title="Add Credits">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select User</label>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Select a user</option>
                      {userCredits.map((user) => (
                        <option key={user.id} value={user.user_id}>
                          {user.email} - {user.plan_type} - {Math.max(0, (user.photos_limit || 0) - (user.photos_used || 0))} credits
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
                      onChange={(e) => setCreditsToAdd(parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Type</label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                  >
                    <option value="free">Free</option>
                    <option value="trial">Trial</option>
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
              </AdminSection>
              
              {/* User Credits Table */}
              <AdminSection title="User Credits">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Email</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Used</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Photos Limit</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Credits Left</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Plan Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCredits.map((credit) => (
                        <tr key={credit.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{credit.email}</td>
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
              </AdminSection>
              
              {/* Delete User Section */}
              <AdminSection title="Delete User">
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
                      {isDeletingUser ? 'Deleting...' : 'Delete User'}
                    </button>
                  </div>
                </div>
                
                {deleteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
                    {deleteError}
                  </div>
                )}
              </AdminSection>
              
              {/* Manage Videos Section */}
              <AdminSection title="Manage Videos">
                {/* Add/Edit Video Form */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-[#1d2939] dark:text-white mb-4">
                    {selectedVideoId ? 'Edit Video' : 'Add New Video'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video Title</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Enter video title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube Video ID</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={videoId}
                        onChange={(e) => setVideoId(e.target.value)}
                        placeholder="e.g. dQw4w9WgXcQ"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video Description</label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Enter video description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    {selectedVideoId ? (
                      <>
                        <button
                          onClick={handleEditVideo}
                          disabled={!videoTitle || !videoId || isEditingVideo}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEditingVideo ? 'Updating...' : 'Update Video'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedVideoId('');
                            setVideoTitle('');
                            setVideoDescription('');
                            setVideoId('');
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleAddVideo}
                        disabled={!videoTitle || !videoId || isAddingVideo}
                        className="bg-[#2563eb] hover:bg-[#1e40af] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingVideo ? 'Adding...' : 'Add Video'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Video Preview */}
                {videoId && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-medium text-[#1d2939] dark:text-white mb-4">Video Preview</h4>
                    <div className="aspect-w-16 aspect-h-9 w-full max-w-md mx-auto">
                      <Suspense fallback={<div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>}>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-64 rounded-lg"
                        ></iframe>
                      </Suspense>
                    </div>
                  </div>
                )}
                
                {/* Videos Table */}
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-medium text-[#1d2939] dark:text-white mb-4">Current Videos</h4>
                  
                  {videos.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No videos found. Add your first video above.</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Title</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Description</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Video ID</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.map((video) => (
                          <tr key={video.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{video.title}</td>
                            <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">
                              {video.description?.length > 50 ? `${video.description.substring(0, 50)}...` : video.description}
                            </td>
                            <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">{video.videoId}</td>
                            <td className="py-2 px-4 text-sm text-[#1d2939] dark:text-white">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSelectVideo(video)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </AdminSection>
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}
