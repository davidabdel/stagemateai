import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { getUserCredits, decrementUserCredits } from '@/utils/supabaseService';

// Initialize the OpenAI client with your API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Validate OpenAI API key is present and log its status (without revealing the full key)
if (!apiKey) {
  console.error('Server: OPENAI_API_KEY is not set in environment variables');
} else {
  // Log first and last few characters of the API key for debugging
  const keyPreview = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`Server: Using OpenAI API key: ${keyPreview}`);
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-for-initialization', // Use dummy key to avoid initialization error
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
      
      // Download the image from the URL
      console.log('Server: Downloading image from URL');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      // Get the image as a buffer
      const imageBuffer = await imageResponse.arrayBuffer();
      console.log('Server: Image downloaded, buffer size:', imageBuffer.byteLength);
      console.log('Server: User agent:', request.headers.get('user-agent'));
      
      // Create a file object directly from the buffer for the OpenAI API
      console.log('Server: Preparing image for OpenAI API');
      const imageFile = await toFile(Buffer.from(imageBuffer), 'image.jpg', { type: 'image/jpeg' });
      console.log('Server: Image file created successfully');
      
      // Call the OpenAI Images Edit API using the SDK
      console.log('Server: Calling OpenAI Images Edit API with gpt-image-1 model');
      console.log('Server: Using prompt:', prompt);
      console.log('Server: Image file size:', imageFile.size, 'bytes');
      
      // Validate OpenAI API key before making the request
      if (!process.env.OPENAI_API_KEY) {
        console.error('Server: Cannot proceed with image generation - OPENAI_API_KEY is missing');
        throw new Error('OpenAI API key is not configured in the server environment');
      }
      
      // Log request details for debugging
      console.log('Server: Image file details:', {
        size: imageFile.size,
        type: imageFile.type,
        name: imageFile.name
      });
  
      // For testing/debugging when API key is missing, return a mock response
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-initialization') {
        console.log('Server: Using mock response due to missing API key');
        throw new Error('OpenAI API key is not properly configured. Please check your environment variables.');
      }
  
      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: prompt,
        n: 1,
        size: "1536x1024", // Keeping the requested size
        quality: "high" // Request high-quality images for better downloads
      });
      
      console.log('Server: OpenAI Images Edit API response received');
      console.log('Server: OpenAI API response structure:', JSON.stringify(response, null, 2));
      
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

    } catch (apiError: unknown) {
      console.error('Server: API error:', apiError);
      
      // Instead of silently returning the original image, return a proper error
      // This will help with debugging and let the client know something went wrong
      const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to generate image';
      console.error('Server: Error details:', errorMessage);
      
      // Check for specific OpenAI error types
      if (apiError instanceof Error) {
        // Log the full error object for debugging
        console.error('Server: Full error object:', JSON.stringify({
          name: apiError.name,
          message: apiError.message,
          stack: apiError.stack,
          cause: apiError.cause
        }, null, 2));
        
        // Check for common OpenAI API errors
        if (errorMessage.includes('API key')) {
          return NextResponse.json({ 
            success: false,
            error: 'OpenAI API key configuration error. Please check your server environment variables.'
          }, { status: 500 });
        }
        
        if (errorMessage.includes('rate limit')) {
          return NextResponse.json({ 
            success: false,
            error: 'OpenAI API rate limit exceeded. Please try again later.'
          }, { status: 429 });
        }
        
        // Check for authentication errors
        if (errorMessage.includes('authentication') || errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
          return NextResponse.json({ 
            success: false,
            error: 'OpenAI API authentication failed. Please check your API key.'
          }, { status: 401 });
        }
      }
      
      return NextResponse.json({ 
        success: false,
        error: errorMessage
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Server: Error in API route:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}