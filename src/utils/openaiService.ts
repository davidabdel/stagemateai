/**
 * Generates a staged image using OpenAI's Images Edit API
 * @param imageUrl URL of the original image
 * @param roomType Type of room (e.g., living room, bedroom)
 * @param styleNotes Additional style notes
 * @param userId User ID for credit tracking
 * @returns URL of the staged image
 */
export async function generateStagedImage(imageUrl: string, roomType: string, styleNotes: string, userId: string) {
  try {
    console.log("Starting OpenAI Images Edit API process");
    console.log("Using image URL:", imageUrl);
    
    // Detect if running on a mobile device with more comprehensive check
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768) ||
                     ('ontouchstart' in window);
    console.log("Device type:", isMobile ? "Mobile" : "Desktop");
    console.log("User agent:", navigator.userAgent);
    console.log("Screen width:", window.innerWidth);
    
    // Call our server-side API route to handle the OpenAI Images Edit API call
    try {
      console.log("Calling server-side API route for image editing");
      
      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, isMobile ? 120000 : 60000); // 2 minutes for mobile, 1 minute for desktop
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          roomType,
          styleNotes,
          userId,
          isMobile, // Flag to indicate if request is from mobile
        }),
        // Add cache control and other options for better mobile compatibility
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      
      // Clear the timeout if request completes
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Check if this is a no credits error (403 Forbidden)
        if (response.status === 403) {
          const errorData = await response.json();
          throw new Error('NO_CREDITS_REMAINING');
        }
        
        // Try to parse the error as JSON first
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `API request failed: ${response.status} ${response.statusText}`;
        } catch (e) {
          // If not JSON, get as text
          const errorText = await response.text();
          errorMessage = `API request failed: ${response.status} ${response.statusText} - ${errorText}`;
        }
        
        console.error('API error details:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Received response from server:", data);
      
      if (data.success) {
        console.log("Successfully generated edited image");
        console.log("Credits remaining:", data.photosRemaining);
        
        // Return both the image URL and credits remaining
        return {
          imageUrl: data.generatedImageUrl,
          creditsRemaining: data.photosRemaining
        };
      } else {
        console.warn("Image editing failed on server");
        // Throw the error so it can be properly handled by the client
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (apiError) {
      console.error("API error:", apiError);
      
      // Handle specific mobile errors
      if (apiError instanceof Error) {
        if (apiError.name === 'AbortError') {
          throw new Error(isMobile ? 
            'Request timed out on mobile device. Please check your connection and try again.' : 
            'Request timed out. Please try again.');
        }
        
        // Handle mobile-specific network errors
        if (isMobile && (apiError.message.includes('network') || apiError.message.includes('fetch'))) {
          throw new Error('Network error on mobile device. Please check your connection and try again.');
        }
      }
      
      // Propagate the error instead of silently using the original image
      // This allows the client to handle the error appropriately
      throw apiError;
    }
  } catch (error) {
    console.error('Error in generateStagedImage function:', error);
    // Propagate the error instead of silently using the original image
    throw error;
  }
}
