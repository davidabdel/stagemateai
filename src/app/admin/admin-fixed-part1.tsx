// This file contains the default video and FAQ data
// It is not meant to be imported or used directly
// The full implementation is in admin-fixed.tsx

/*
 * SAMPLE CODE - NOT FOR DIRECT IMPORT
 * This is a code sample showing the default data for videos and FAQs
 * To use this code, copy the relevant parts to your admin-fixed.tsx file
 */

import React from 'react';

// Sample component to demonstrate default data usage
export default function DefaultDataSample() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Default Data Sample</h1>
      <p className="mb-4">This file contains the default video and FAQ data used when Supabase tables don't exist.</p>
      <p className="mb-4">To use this code, copy the defaultVideoTutorials and defaultFaqItems arrays to your admin-fixed.tsx file.</p>
    </div>
  );
}

// Default FAQ items in case database fetch fails
export const defaultFaqItems = [
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
export const defaultVideoTutorials = [
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