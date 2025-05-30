/**
 * Utility to fix mirrored images on mobile devices
 * This approach doesn't interfere with the image processing pipeline
 */

// Check if the current device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768)
  );
};

// Apply horizontal flip to AI-generated images on mobile devices
export const fixMirroredImages = (): void => {
  if (!isMobileDevice()) return;
  
  // Find all AI-generated images (those with staged_url in the src)
  setTimeout(() => {
    const aiImages = document.querySelectorAll('img[src*="staged_url"]');
    console.log('Found AI images to fix:', aiImages.length);
    
    // Apply transform to each image
    aiImages.forEach(img => {
      // Only apply the transform if it hasn't been applied yet
      if (!(img as HTMLElement).style.transform) {
        console.log('Applying horizontal flip to AI image on mobile');
        (img as HTMLElement).style.transform = 'scaleX(-1)';
      }
    });
  }, 500); // Small delay to ensure images are in the DOM
};

// Set up a mutation observer to watch for new images
export const setupMirrorFixObserver = (): (() => void) => {
  if (typeof window === 'undefined' || !isMobileDevice()) {
    return () => {}; // Return empty cleanup function if not in browser or not mobile
  }
  
  // Initial fix for any images already in the DOM
  fixMirroredImages();
  
  // Create observer to watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' || 
          (mutation.type === 'attributes' && 
           mutation.attributeName === 'src')) {
        fixMirroredImages();
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });
  
  // Return cleanup function
  return () => observer.disconnect();
};
