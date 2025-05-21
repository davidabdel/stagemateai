import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/utils/supabaseClient';
import { toFile } from 'openai/uploads';
import { decrementUserCredits } from '@/utils/userCredits';

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT: This API route uses the OpenAI Images Edit API with gpt-image-1 model
export async function POST(request: NextRequest) {
  try {
    console.log('Server: Received request to generate image');
    
    // Parse the request body
    const body = await request.json();
    const { imageUrl, roomType, styleNotes, userId } = body;
    
    // Check if userId is provided
    if (!userId) {
      console.error('Server: User ID is required');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log('Server: User ID:', userId);
    
    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('photos_used, photos_limit')
      .eq('user_id', userId)
      .single();
    
    if (userError) {
      console.error('Server: Error fetching user data:', userError);
      return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
    
    const photosUsed = userData?.photos_used || 0;
    const photosLimit = userData?.photos_limit || 0;
    
    // Check if user has enough credits
    const creditsRemaining = photosLimit - photosUsed;
    
    if (creditsRemaining <= 0) {
      console.log('Server: User has no credits remaining');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade your plan.' },
        { status: 403 }
      );
    }
    
    console.log('Server: User credits remaining:', creditsRemaining);

    try {
      // Build the prompt exactly as requested
      // Preserve all fixed items, walls, windows, doors, pools, railings, and stairs.
      // Preserve all colors of the actual house walls interior or exterior.
      // Preserve all home appliances such as fridges, washing machines, etc.
      // Do not add any building's or furniture unless it is asked in the style notes. 

      const prompt = `Create an image turn the attached image into a real-estate ready image, make it more inviting while keeping it true to itself as it's to sell the property
      Preserve all fixed items, walls, windows, doors, pools, railings, and stairs.
      Preserve all colors of the actual house walls interior or exterior.
      Preserve all home appliances such as fridges, washing machines, etc.
      
This is a ${roomType?.toLowerCase() || 'room'}${styleNotes ? ` with ${styleNotes} style` : ''}.`;
      
      console.log('Server: Using Images Generate API prompt:', prompt);
      
      try {
        // Download the image from the URL
        console.log('Server: Downloading image from URL');
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        
        // Get the image as a buffer
        const imageBuffer = await imageResponse.arrayBuffer();
        console.log('Server: Image downloaded, buffer size:', imageBuffer.byteLength);
        
        // Create a file object directly from the buffer for the OpenAI API
        console.log('Server: Preparing image for OpenAI API');
        const imageFile = await toFile(Buffer.from(imageBuffer), 'image.jpg', { type: 'image/jpeg' });
        console.log('Server: Image file created successfully');
        
        // Call the OpenAI Images Edit API using the SDK
        console.log('Server: Calling OpenAI Images Edit API with gpt-image-1 model');
        console.log('Server: Using prompt:', prompt);
        
        const response = await openai.images.edit({
          model: "gpt-image-1",
          image: imageFile,
          prompt: prompt,
          n: 1,
          size: "1024x1024", // Using 1024x1024 size for optimal compatibility
          quality: "high" // Request high-quality images for better downloads
        });
        
        console.log('Server: OpenAI Images Edit API response received');
        console.log('Server: OpenAI API response structure:', JSON.stringify(response, null, 2));
        
        // No temporary file to clean up with the new approach
        
        // Handle the response
        if (response.data && response.data.length > 0) {
          let generatedImageUrl;
          
          // Check if response contains a URL
          if (response.data[0].url) {
            generatedImageUrl = response.data[0].url;
            console.log('Server: Generated image URL from direct URL');
          } 
          // Check if response contains base64 data
          else if (response.data[0].b64_json) {
            // Convert base64 to URL by creating a data URL
            generatedImageUrl = `data:image/png;base64,${response.data[0].b64_json}`;
            console.log('Server: Generated image URL from base64 data');
          }
          
          if (generatedImageUrl) {
            console.log('Server: Generated image URL:', generatedImageUrl.substring(0, 50) + '...');
            
            // Decrement user credits after successful image generation
            const { photosRemaining, error: decrementError } = await decrementUserCredits(userId);
            
            if (decrementError) {
              console.error('Server: Error decrementing user credits:', decrementError);
              // Continue anyway since the image was generated successfully
            } else {
              console.log('Server: Credits decremented successfully. Remaining photos:', photosRemaining);
            }
            
            // Store the generated image in the database
            const { error: insertError } = await supabase
              .from('generated_images')
              .insert([
                {
                  user_id: userId,
                  original_image_url: imageUrl,
                  generated_image_url: generatedImageUrl,
                  room_type: roomType || null,
                  style_notes: styleNotes || null,
                  prompt: prompt,
                  created_at: new Date().toISOString()
                }
              ]);
            
            if (insertError) {
              console.error('Server: Error storing generated image in database:', insertError);
              // Continue anyway since the image was generated successfully
            } else {
              console.log('Server: Generated image stored in database');
            }
            
            // Return the generated image URL
            return NextResponse.json({ 
              imageUrl: generatedImageUrl,
              photosRemaining: photosRemaining !== undefined ? photosRemaining : (photosLimit - photosUsed - 1)
            });
          } else {
            console.error('Server: No image URL or base64 data in response');
            return NextResponse.json({ error: 'No image URL or base64 data in response' }, { status: 500 });
          }
        } else {
          console.error('Server: No data in response');
          return NextResponse.json({ error: 'No data in response' }, { status: 500 });
        }
      } catch (error) {
        console.error('Server: Error generating image:', error);
        return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
      }
    } catch (error) {
      console.error('Server: Unexpected error:', error);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server: Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}