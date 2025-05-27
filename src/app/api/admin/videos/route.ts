import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

// Default video tutorials as fallback for Vercel deployment
const DEFAULT_VIDEOS = [
  {
    id: '1',
    title: 'Getting Started with StageMate AI',
    description: 'Learn the basics of using StageMate AI to create stunning product images.',
    videoId: 'jO0ILN23L-g', // Replace with your actual YouTube video ID
    thumbnail: 'https://i9.ytimg.com/vi/jO0ILN23L-g/mqdefault.jpg?sqp=CKDUgMEG-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBogNyh_MA8=&rs=AOn4CLBWg5O4NBRRpwZhkIRzi6sSi7SneA' 
  },
  {
    id: '2',
    title: 'Dont List an Empty Home',
    description: 'Turn your empty home into a staged home with StageMate AI.',
    videoId: 's_ZeJZx4_n8', 
    thumbnail: 'https://i9.ytimg.com/vi/s_ZeJZx4_n8/mqdefault.jpg?sqp=CKDUgMEG-oaymwEmCMACELQB8quKqQMa8AEB-AHwB4AC0AWKAgwIABABGGUgWyhEMA8=&rs=AOn4CLCEqM3klHLeBpjiJUdDJT5zBgwFVg' 
  }
];

export async function GET() {
  try {
    console.log('Fetching videos from Supabase...');
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching videos:', error);
      console.log('Using default videos instead');
      return NextResponse.json({ videos: DEFAULT_VIDEOS });
    }
    
    if (!data || data.length === 0) {
      console.log('No videos found in database, using defaults');
      return NextResponse.json({ videos: DEFAULT_VIDEOS });
    }
    
    console.log(`Successfully fetched ${data.length} videos from database`);
    return NextResponse.json({ videos: data });
  } catch (error) {
    console.error('Error fetching videos:', error);
    console.log('Using default videos due to error');
    // Return default videos instead of an error
    return NextResponse.json({ videos: DEFAULT_VIDEOS });
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