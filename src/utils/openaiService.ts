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
    
    // Call our server-side API route to handle the OpenAI Images Edit API call
    try {
      console.log("Calling server-side API route for image editing");
      
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
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Received response from server:", data);
      
      if (data.success) {
        console.log("Successfully generated edited image");
        console.log("Credits remaining:", data.creditsRemaining);
        
        // Return both the image URL and credits remaining
        return {
          imageUrl: data.generatedImageUrl,
          creditsRemaining: data.creditsRemaining
        };
      } else {
        console.warn("Image editing failed on server, using fallback");
        // Return the original image as fallback
        return {
          imageUrl: imageUrl,
          creditsRemaining: null
        };
      }
    } catch (apiError) {
      console.error("API error:", apiError);
      console.log("Using original image as fallback");
      return {
        imageUrl: imageUrl,
        creditsRemaining: null
      }; // Fallback to original image
    }
  } catch (error) {
    console.error('Error in generateStagedImage function:', error);
    // Return the original image as fallback
    return imageUrl;
  }
}
