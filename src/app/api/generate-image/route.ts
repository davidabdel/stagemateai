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
    const { imageUrl, roomType, styleNotes, userId, isMobile } = body;
    
    // Log if request is from mobile device
    console.log('Server: Request from mobile device:', isMobile ? 'Yes' : 'No');
    
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

 
Do not change any colours of the actual house walls interior or exterior.

Do not remove items like, fridges, cupboards, hallways or rooms. 

This is a ${roomType?.toLowerCase() || 'room'}${styleNotes ? ` with ${styleNotes} style` : ''}.`;
      
      console.log('Server: Using Images Generate API prompt:', prompt);
      
      try {
        // Download the image from the URL
        console.log('Server: Downloading image from URL');
        
        // Use different fetch options for mobile devices
        const fetchOptions: RequestInit = isMobile ? {
          // Mobile-specific fetch options
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*, */*',
            'User-Agent': 'Mozilla/5.0 (compatible; Mobile Image Processor)',
          },
          // Add timeout for mobile connections
          signal: AbortSignal.timeout(30000) // 30 second timeout for mobile
        } : {
          // Desktop fetch options
          signal: AbortSignal.timeout(15000) // 15 second timeout for desktop
        };
        
        console.log('Server: Using fetch options:', JSON.stringify(fetchOptions));
        const imageResponse = await fetch(imageUrl, fetchOptions);
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        
        // Get the image as a buffer with mobile-specific handling
        const imageBuffer = await imageResponse.arrayBuffer();
        console.log('Server: Image downloaded, buffer size:', imageBuffer.byteLength);
        
        // Validate buffer size (mobile devices may have memory limitations)
        const maxBufferSize = isMobile ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for mobile, 50MB for desktop
        if (imageBuffer.byteLength > maxBufferSize) {
          throw new Error(`Image too large: ${imageBuffer.byteLength} bytes (max: ${maxBufferSize} bytes)`);
        }
        
        // Create a file object directly from the buffer for the OpenAI API
        console.log('Server: Preparing image for OpenAI API');
        
        // Use different file naming strategy for mobile to avoid encoding issues
        const fileName = isMobile ? 'mobile_image.jpg' : 'image.jpg';
        
        const imageFile = await toFile(Buffer.from(imageBuffer), fileName, { 
          type: 'image/jpeg',
          // Add mobile-specific options if needed
          ...(isMobile && { lastModified: Date.now() })
        });
        console.log('Server: Image file created successfully');
        
        // Validate the created file
        if (!imageFile || imageFile.size === 0) {
          throw new Error('Failed to create valid image file from buffer');
        }
      
        // Call the OpenAI Images Edit API using the SDK
        console.log('Server: Calling OpenAI Images Edit API with gpt-image-1 model');
        console.log('Server: Using prompt:', prompt);
        
        // Add additional error handling for mobile
        try {
          // Use a more reliable approach for mobile devices
          const apiOptions = {
            model: "gpt-image-1",
            image: imageFile,
            prompt: prompt,
            n: 1,
            size: "1024x1024" as "1024x1024", // Type assertion for TypeScript
            quality: isMobile ? "medium" as const : "high" as const // Use medium quality for mobile to reduce errors
          };
          
          console.log('Server: Using API options:', JSON.stringify(apiOptions, (key, value) => {
            // Don't log the actual file content
            if (key === 'image') return '[File Object]';
            return value;
          }));
          
          // Add retry logic for mobile devices
          let response;
          const maxRetries = isMobile ? 2 : 1; // More retries for mobile
          let lastError: Error | null = null;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`Server: API attempt ${attempt}/${maxRetries}`);
              response = await openai.images.edit(apiOptions);
              break; // Success, exit retry loop
            } catch (apiError) {
              lastError = apiError as Error;
              console.error(`Server: API attempt ${attempt} failed:`, lastError.message);
              
              if (attempt < maxRetries) {
                // Wait before retry (longer wait for mobile)
                const waitTime = isMobile ? 2000 * attempt : 1000 * attempt;
                console.log(`Server: Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
              }
            }
          }
          
          if (!response && lastError) {
            throw lastError;
          }
          
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
        } catch (error) {
          const mobileApiError = error as Error;
          console.error('Server: Mobile-specific OpenAI API error:', mobileApiError);
          
          // For mobile devices, provide a more detailed error message
          if (isMobile) {
            console.log('Server: Handling mobile-specific error with more details');
            throw new Error(`Mobile API error: ${mobileApiError.message || 'Unknown error'}`); 
          }
          
          // Re-throw for non-mobile devices
          throw mobileApiError;
        }
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