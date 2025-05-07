import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ faqs: data });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
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
