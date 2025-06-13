import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

// Default FAQ items as fallback for Vercel deployment
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

export async function GET() {
  try {
    console.log('Fetching FAQs from Supabase...');
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching FAQs:', error);
      console.log('Using default FAQs instead');
      return NextResponse.json({ faqs: DEFAULT_FAQS });
    }
    
    if (!data || data.length === 0) {
      console.log('No FAQs found in database, using defaults');
      return NextResponse.json({ faqs: DEFAULT_FAQS });
    }
    
    console.log(`Successfully fetched ${data.length} FAQs from database`);
    return NextResponse.json({ faqs: data });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    console.log('Using default FAQs due to error');
    // Return default FAQs instead of an error
    return NextResponse.json({ faqs: DEFAULT_FAQS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer } = body;
    
    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }
    
    // Insert new FAQ
    const { data, error } = await supabase
      .from('faqs')
      .insert([{ question, answer }])
      .select();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true, faq: data[0] });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}