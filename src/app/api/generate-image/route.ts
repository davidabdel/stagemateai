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
        console.log('Server: Image file size:', imageFile.size, 'bytes');
        
        // Verify the image file is valid
        if (!imageFile || imageFile.size === 0) {
          throw new Error('Invalid image file: File is empty or corrupted');
        }
        
        // Verify API key is set
        if (!process.env.OPENAI_API_KEY) {
          console.error('Server: OpenAI API key is not set');
          throw new Error('OpenAI API key is not configured');
        }
        
        try {
          const openaiResponse = await openai.images.edit({
            model: "gpt-image-1",
            image: imageFile,
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "high"
          });
          
          console.log('Server: OpenAI API call successful');
          
          console.log('Server: OpenAI Images Edit API response received');
          console.log('Server: OpenAI API response structure:', JSON.stringify(openaiResponse, null, 2));
          
          // No temporary file to clean up with the new approach
          
          // Handle the response
          if (openaiResponse.data && openaiResponse.data.length > 0) {
            let generatedImageUrl;
            
            // Check if response contains a URL
            if (openaiResponse.data[0].url) {
              generatedImageUrl = openaiResponse.data[0].url;
              console.log('Server: Generated image URL from direct URL');
            } 
            // Check if response contains base64 data
            else if (openaiResponse.data[0].b64_json) {
              // Convert base64 to URL by creating a data URL
              generatedImageUrl = `data:image/png;base64,${openaiResponse.data[0].b64_json}`;
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
          console.error('Server: Invalid response structure from OpenAI:', openaiResponse);
          throw new Error('Invalid response structure from OpenAI API');
        } catch (openaiError) {
          console.error('Server: OpenAI API call failed:', openaiError);
          
          // Check for specific OpenAI error types
          const errorMessage = openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error';
          
          if (errorMessage.includes('billing') || errorMessage.includes('exceeded your quota')) {
            throw new Error('OpenAI API billing error: ' + errorMessage);
          } else if (errorMessage.includes('invalid_api_key')) {
            throw new Error('Invalid OpenAI API key');
          } else if (errorMessage.includes('file format') || errorMessage.includes('image format')) {
            throw new Error('Image format error: ' + errorMessage);
          } else {
            throw new Error('OpenAI API error: ' + errorMessage);
          }
        }
        
        // The response handling is now done inside the try block above

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