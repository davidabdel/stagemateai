import { NextResponse } from 'next/server';

// Access the mock videos from the parent route
// This is a workaround for demonstration purposes
// In a real app, you would use a database or a proper state management solution
declare const mockVideos: any[];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, videoId, thumbnail } = body;
    
    // Validate required fields
    if (!title || !videoId) {
      return NextResponse.json(
        { error: 'Title and YouTube Video ID are required' },
        { status: 400 }
      );
    }
    
    // Find the video in our mock data
    const videoIndex = mockVideos.findIndex(v => v.id === id);
    
    if (videoIndex === -1) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Update the video
    const updatedVideo = {
      ...mockVideos[videoIndex],
      title,
      description,
      videoId,
      thumbnail: thumbnail || mockVideos[videoIndex].thumbnail,
      updated_at: new Date().toISOString()
    };
    
    // Replace the old video with the updated one
    mockVideos[videoIndex] = updatedVideo;
    
    return NextResponse.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find the video in our mock data
    const videoIndex = mockVideos.findIndex(v => v.id === id);
    
    if (videoIndex === -1) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Remove the video from our mock array
    mockVideos.splice(videoIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}