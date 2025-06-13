import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

// Default video tutorials to initialize the database
const defaultVideoTutorials = [
  {
    title: 'Getting Started with StageMate AI',
    description: 'Learn the basics of using StageMate AI to create stunning product images.',
    videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    thumbnail: '/images/video-thumbnail-1.jpg' // Replace with your actual thumbnail path
  },
  {
    title: 'Advanced Staging Techniques',
    description: 'Take your product images to the next level with these advanced techniques.',
    videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    thumbnail: '/images/video-thumbnail-2.jpg' // Replace with your actual thumbnail path
  },
  {
    title: 'Optimizing Your Images for E-commerce',
    description: 'Learn how to optimize your staged images for maximum impact on e-commerce platforms.',
    videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    thumbnail: '/images/video-thumbnail-3.jpg' // Replace with your actual thumbnail path
  }
];

// Default FAQ items to initialize the database
const defaultFaqItems = [
  {
    question: 'How do I create my first image?',
    answer: 'Navigate to the dashboard, click on "Create New Image", upload your product image, and follow the prompts to generate your staged image.'
  },
  {
    question: 'What file formats are supported?',
    answer: 'We support JPG, PNG, and WEBP formats. For best results, use high-resolution images with clear product visibility.'
  },
  {
    question: 'How many credits do I need per image?',
    answer: 'Each image generation uses 1 credit. The number of credits you have depends on your subscription plan.'
  },
  {
    question: 'Can I upgrade my plan?',
    answer: 'Yes! You can upgrade your plan at any time from the dashboard by clicking on "Upgrade" in the top right corner.'
  },
  {
    question: 'How do I download my images?',
    answer: 'Your generated images will appear in your dashboard. Click on any image and use the download button to save it to your device.'
  },
  {
    question: 'What if I run out of credits?',
    answer: 'You can purchase additional credits or upgrade your plan to get more credits. Visit the dashboard and click on "Get More Credits".'
  }
];

export async function GET() {
  try {
    // First, try to directly insert the default videos
    console.log('Attempting to insert default videos...');
    const { data: insertedVideos, error: insertVideosError } = await supabase
      .from('videos')
      .insert(defaultVideoTutorials)
      .select();
    
    if (insertVideosError) {
      console.error('Error inserting default videos:', insertVideosError.message);
      
      // If the error is about the table not existing, we'll handle that in the admin dashboard
      if (insertVideosError.message.includes('does not exist')) {
        console.log('Videos table does not exist. This will be handled in the admin dashboard.');
      }
    } else {
      console.log(`Successfully added ${insertedVideos?.length || 0} default videos`);
    }
    
    // Try to insert default FAQs
    console.log('Attempting to insert default FAQs...');
    const { data: insertedFaqs, error: insertFaqsError } = await supabase
      .from('faqs')
      .insert(defaultFaqItems)
      .select();
    
    if (insertFaqsError) {
      console.error('Error inserting default FAQs:', insertFaqsError.message);
      
      // If the error is about the table not existing, we'll handle that in the admin dashboard
      if (insertFaqsError.message.includes('does not exist')) {
        console.log('FAQs table does not exist. This will be handled in the admin dashboard.');
      }
    } else {
      console.log(`Successfully added ${insertedFaqs?.length || 0} default FAQs`);
    }
    
    // Check if videos exist in the database
    const { data: existingVideos, error: videosCheckError } = await supabase
      .from('videos')
      .select('*');
    
    let videosCount = 0;
    if (videosCheckError) {
      console.error('Error checking videos:', videosCheckError.message);
    } else {
      videosCount = existingVideos?.length || 0;
      console.log(`Found ${videosCount} videos in the database`);
    }
    
    // Check if FAQs exist in the database
    const { data: existingFaqs, error: faqsCheckError } = await supabase
      .from('faqs')
      .select('*');
    
    let faqsCount = 0;
    if (faqsCheckError) {
      console.error('Error checking FAQs:', faqsCheckError.message);
    } else {
      faqsCount = existingFaqs?.length || 0;
      console.log(`Found ${faqsCount} FAQs in the database`);
    }
    
    return new NextResponse(JSON.stringify({ 
      success: true, 
      message: 'Default content initialization completed',
      videosCount: videosCount,
      faqsCount: faqsCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error initializing default content:', error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      error: 'Failed to initialize default content' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
