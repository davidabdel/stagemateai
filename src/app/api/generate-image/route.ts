import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { getUserCredits, decrementUserCredits } from '@/utils/supabaseService';

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT: This API route uses the OpenAI Images Edit API with gpt-image-1 model
// Format follows the official documentation at https://platform.openai.com/docs/api-reference/images/create
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { imageUrl, roomType, styleNotes, userId } = body;
    
    // Check if userId is provided
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Server: Processing image generation request');
    console.log('Server: Image URL:', imageUrl);
    console.log('Server: Room Type:', roomType);
    console.log('Server: Style Notes:', styleNotes);
    console.log('Server: User ID:', userId);
    
    // Check user credits
    const { data: userCredits, error: creditsError } = await getUserCredits(userId);
    
    if (creditsError) {
      console.error('Server: Error fetching user credits:', creditsError);
      return NextResponse.json(
        { error: 'Error checking user credits' },
        { status: 500 }
      );
    }
    
    // Check if user has enough credits
    if (!userCredits || userCredits.credits_remaining <= 0) {
      console.log('Server: User has no credits remaining');
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade your plan.' },
        { status: 403 }
      );
    }
    
    console.log('Server: User has', userCredits.credits_remaining, 'credits remaining');

    try {
      // Build the prompt exactly as requested
      const prompt = `Create an image and turn the attached image into a real-estate ready image, make it more inviting. Do Not change any fixed building items such as walls, windows and doors. 

IMPORTANT: Do not change colors or the Benchtops, Walls, Splashbacks and Tiles. 
Do not change any colours of the actual house walls interior or exterior.

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
          size: "1024x1024",
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
            
            return NextResponse.json({ 
              generatedImageUrl,
              success: true,
              photosRemaining
            });
          }
        }
        
        // If we get here, the response structure was invalid
        console.error('Server: Invalid response structure from OpenAI:', response);
        throw new Error('Invalid response structure from OpenAI API');

      } catch (openaiError) {
        console.error('Server: OpenAI API error:', openaiError);
        throw openaiError;
      }
    } catch (apiError: unknown) {
      console.error('Server: API error:', apiError);
      
      // For demo/development, return the original image as fallback
      return NextResponse.json({ 
        generatedImageUrl: imageUrl,
        success: false,
        error: apiError instanceof Error ? apiError.message : 'Failed to generate image'
      });
    }
  } catch (error: unknown) {
    console.error('Server: Error in API route:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}