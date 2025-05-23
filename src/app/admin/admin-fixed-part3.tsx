// This file contains the updated fetch functions for videos and FAQs
// It is not meant to be imported or used directly
// The full implementation is in admin-fixed.tsx

/*
 * SAMPLE CODE - NOT FOR DIRECT IMPORT
 * This is a code sample showing the updated fetch functions for videos and FAQs
 * To use this code, copy the relevant parts to your admin-fixed.tsx file
 */

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Sample component to demonstrate the fetch functions
export default function FetchFunctionsSample() {
  // These state variables would be defined in your actual component
  const [videos, setVideos] = useState([]);
  const [faqs, setFaqs] = useState([]);
  
  // Mock Supabase client for demonstration
  const supabase = createClient('https://your-project-url.supabase.co', 'your-anon-key');
  
  // Import default data from part1
  const defaultVideoTutorials = [
    {
      id: '1',
      title: 'Getting Started with StageMate AI',
      description: 'Learn the basics of using StageMate AI to create stunning product images.',
      videoId: 'jO0ILN23L-g',
      thumbnail: 'https://example.com/thumbnail1.jpg'
    },
    {
      id: '2',
      title: 'Dont List an Empty Home',
      description: 'Turn your empty home into a staged home with StageMate AI.',
      videoId: 's_ZeJZx4_n8',
      thumbnail: 'https://example.com/thumbnail2.jpg'
    }
  ];
  
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
    }
  ];

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
        setVideos(videosData);
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
        setFaqs(faqsData);
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
  
  // Sample UI to demonstrate usage
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fetch Functions Sample</h1>
      <p className="mb-4">This file contains the updated fetch functions for videos and FAQs.</p>
      <p className="mb-4">To use this code, copy the fetchVideos and fetchFaqs functions to your admin-fixed.tsx file.</p>
      <div className="flex space-x-4">
        <button 
          onClick={() => fetchVideos()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Fetch Videos
        </button>
        <button 
          onClick={() => fetchFaqs()}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Fetch FAQs
        </button>
      </div>
    </div>
  );
}