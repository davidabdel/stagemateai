import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ videos: data });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, videoId, thumbnail } = body;
    
    // Validate required fields
    if (!title || !videoId) {
      return NextResponse.json(
        { error: 'Title and YouTube Video ID are required' },
        { status: 400 }
      );
    }
    
    // Insert new video
    const { data, error } = await supabase
      .from('videos')
      .insert([
        { 
          title, 
          description, 
          videoId,
          thumbnail: thumbnail || `/images/video-thumbnail-default.jpg`
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true, video: data[0] });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
