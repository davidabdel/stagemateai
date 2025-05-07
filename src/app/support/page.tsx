'use client';

import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

// Define types for FAQs and videos
type FAQ = {
  id: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
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
const defaultVideoTutorials = [
  {
    id: '1',
    title: 'Getting Started with StageMate AI',
    description: 'Learn the basics of using StageMate AI to create stunning product images.',
    videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    thumbnail: '/images/video-thumbnail-1.jpg' // Replace with your actual thumbnail path
  },
  {
    id: '2',
    title: 'Advanced Staging Techniques',
    description: 'Take your product images to the next level with these advanced techniques.',
    videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    thumbnail: '/images/video-thumbnail-2.jpg' // Replace with your actual thumbnail path
  },
  {
    id: '3',
    title: 'Optimizing Your Images for E-commerce',
    description: 'Learn how to optimize your staged images for maximum impact on e-commerce platforms.',
    videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    thumbnail: '/images/video-thumbnail-3.jpg' // Replace with your actual thumbnail path
  }
];

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('videos');
  
  // State for videos and FAQs
  const [videoTutorials, setVideoTutorials] = useState<Video[]>(defaultVideoTutorials);
  const [faqItems, setFaqItems] = useState<FAQ[]>(defaultFaqItems);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch videos and FAQs from the database
  useEffect(() => {
    const fetchVideosAndFaqs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch videos from database
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .order('id', { ascending: true });
        
        if (videosError) {
          console.error('Error fetching videos:', videosError);
        } else if (videosData && videosData.length > 0) {
          setVideoTutorials(videosData);
        }
        
        // Fetch FAQs from database
        const { data: faqsData, error: faqsError } = await supabase
          .from('faqs')
          .select('*')
          .order('id', { ascending: true });
        
        if (faqsError) {
          console.error('Error fetching FAQs:', faqsError);
        } else if (faqsData && faqsData.length > 0) {
          setFaqItems(faqsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideosAndFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !message) {
      setFormStatus({
        success: false,
        message: 'Please fill out all required fields.'
      });
      return;
    }
    
    // Here you would typically send the form data to your backend
    // For now, we'll just simulate a successful submission
    setFormStatus({
      success: true,
      message: 'Your message has been sent. We\'ll get back to you soon!'
    });
    
    // Reset form
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  // YouTube video component with Suspense
  const YouTubeVideo = ({ videoId }: { videoId: string }) => (
    <div className="aspect-w-16 aspect-h-9 w-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      ></iframe>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1d2939] dark:text-white mb-4">Support Center</h1>
          <p className="text-lg text-[#64748b] dark:text-[#94a3b8] max-w-3xl mx-auto">
            Get help with StageMate AI. Browse our video tutorials, check the FAQs, or contact our support team.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-4 bg-white dark:bg-[#18181b] rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'videos'
                  ? 'bg-[#2563eb] text-white'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#2563eb] dark:hover:text-[#60a5fa]'
              }`}
            >
              Video Tutorials
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'faqs'
                  ? 'bg-[#2563eb] text-white'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#2563eb] dark:hover:text-[#60a5fa]'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'contact'
                  ? 'bg-[#2563eb] text-white'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#2563eb] dark:hover:text-[#60a5fa]'
              }`}
            >
              Contact Us
            </button>
          </nav>
        </div>
        
        {/* Content Sections */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
            </div>
          ) : (
            <>
              {/* Video Tutorials Section */}
              {activeTab === 'videos' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d2939] dark:text-white mb-6">Video Tutorials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videoTutorials.map((video: Video) => (
                      <div key={video.id} className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-lg overflow-hidden shadow-md">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white mb-2">{video.title}</h3>
                          <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">{video.description}</p>
                          <Suspense fallback={<div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>}>
                            <YouTubeVideo videoId={video.videoId} />
                          </Suspense>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* FAQs Section */}
              {activeTab === 'faqs' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d2939] dark:text-white mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqItems.map((faq: FAQ, index: number) => (
                      <div key={faq.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white mb-2">{faq.question}</h3>
                        <p className="text-[#64748b] dark:text-[#94a3b8]">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contact Form Section */}
              {activeTab === 'contact' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1d2939] dark:text-white mb-6">Contact Support</h2>
                  <p className="text-[#64748b] dark:text-[#94a3b8] mb-6">
                    Need help with something specific? Fill out the form below and our support team will get back to you as soon as possible.
                  </p>
                  
                  {formStatus && (
                    <div className={`p-4 mb-6 rounded-md ${formStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {formStatus.message}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="bg-[#2563eb] hover:bg-[#1e40af] text-white px-6 py-2 rounded-md font-medium transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Additional Help Links */}
        <div className="text-center">
          <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">
            Need more help? Check out our <Link href="/docs" className="text-[#2563eb] hover:underline">documentation</Link> or <Link href="/blog" className="text-[#2563eb] hover:underline">blog</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
