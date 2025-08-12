import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Create videos table with minimal structure
    const createVideosResult = await supabase
      .from('videos')
      .insert([
        {
          title: 'Getting Started with StageMate AI',
          description: 'Learn the basics of using StageMate AI to create stunning product images.',
          videoId: 'dQw4w9WgXcQ',
          thumbnail: '/images/video-thumbnail-1.jpg'
        }
      ])
      .select();

    // Create FAQs table with minimal structure
    const createFaqsResult = await supabase
      .from('faqs')
      .insert([
        {
          question: 'How do I create my first image?',
          answer: 'Navigate to the dashboard, click on "Create New Image", upload your product image, and follow the prompts to generate your staged image.'
        }
      ])
      .select();

    return NextResponse.json({
      success: true,
      message: 'Tables created with sample data',
      videosResult: createVideosResult,
      faqsResult: createFaqsResult
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json({
      success: false,
      error: error,
      message: 'Error creating tables. This likely means the tables do not exist in your Supabase database. Please create them manually using the SQL in create-support-tables.sql.'
    }, { status: 500 });
  }
}
