import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Check if videos table exists by trying to select from it
    const { error: videosError } = await supabase
      .from('videos')
      .select('id')
      .limit(1);

    let videosTableExists = !videosError;
    let faqsTableExists = false;

    // If videos table doesn't exist, we'll get an error
    if (videosError) {
      console.log('Videos table check error:', videosError);
    }

    // Check if faqs table exists by trying to select from it
    const { error: faqsError } = await supabase
      .from('faqs')
      .select('id')
      .limit(1);

    if (!faqsError) {
      faqsTableExists = true;
    } else {
      console.log('FAQs table check error:', faqsError);
    }

    // Return the current status
    return NextResponse.json({
      success: true,
      message: 'Support tables status checked',
      videosTableExists,
      faqsTableExists,
      note: 'Please create these tables directly in the Supabase dashboard. The SQL is provided in /create-support-tables.sql'
    });
  } catch (error) {
    console.error('Error checking support tables:', error);
    return NextResponse.json(
      { error: 'Failed to check support tables', details: error },
      { status: 500 }
    );
  }
}
