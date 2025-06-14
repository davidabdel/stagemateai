/**
 * Mobile-specific image processing utilities
 * Handles EXIF orientation, mobile browser quirks, and optimization
 */

// Check if running on mobile device
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768)
  );
};

// Helper function to read file as base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to create canvas and get image data
const createCanvasFromImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  // Draw image to canvas (this strips EXIF data)
  ctx.drawImage(img, 0, 0);
  
  return canvas;
};

// Convert canvas to File
const canvasToFile = (canvas: HTMLCanvasElement, fileName: string, quality: number = 0.9): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', quality);
  });
};

/**
 * Process image for mobile devices to fix orientation and optimize
 * This function strips EXIF data and normalizes the image
 */
export const processImageForMobile = async (file: File): Promise<File> => {
  // Only process on mobile devices
  if (!isMobileDevice()) {
    return file;
  }
  
  try {
    console.log('Mobile: Processing image for mobile device');
    
    // Create an image element to load the file
    const img = new Image();
    const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
    
    // Convert file to object URL
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Wait for image to load
    await imageLoadPromise;
    
    // Create canvas and draw image (this normalizes orientation)
    const canvas = createCanvasFromImage(img);
    
    // Clean up object URL
    URL.revokeObjectURL(objectUrl);
    
    // Convert canvas back to file with reduced quality for mobile
    const processedFile = await canvasToFile(canvas, file.name, 0.85);
    
    console.log('Mobile: Image processed successfully');
    console.log('Mobile: Original size:', file.size, 'bytes');
    console.log('Mobile: Processed size:', processedFile.size, 'bytes');
    
    return processedFile;
  } catch (error) {
    console.error('Mobile: Error processing image:', error);
    // Return original file if processing fails
    return file;
  }
};

/**
 * Optimize image dimensions for mobile upload
 * Reduces image size if too large for mobile processing
 */
export const optimizeImageForMobile = async (file: File): Promise<File> => {
  // Only optimize on mobile devices
  if (!isMobileDevice()) {
    return file;
  }
  
  try {
    const img = new Image();
    const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
    
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    await imageLoadPromise;
    
    const maxWidth = 1920; // Maximum width for mobile
    const maxHeight = 1920; // Maximum height for mobile
    
    // Check if image needs resizing
    if (img.naturalWidth <= maxWidth && img.naturalHeight <= maxHeight) {
      URL.revokeObjectURL(objectUrl);
      return file; // No need to resize
    }
    
    console.log('Mobile: Resizing large image for mobile processing');
    
    // Calculate new dimensions maintaining aspect ratio
    let { width, height } = img;
    if (width > height) {
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    }
    
    // Create canvas with new dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);
    
    URL.revokeObjectURL(objectUrl);
    
    // Convert to file
    const optimizedFile = await canvasToFile(canvas, file.name, 0.8);
    
    console.log('Mobile: Image resized from', img.naturalWidth + 'x' + img.naturalHeight, 
                'to', width + 'x' + height);
    
    return optimizedFile;
  } catch (error) {
    console.error('Mobile: Error optimizing image:', error);
    return file;
  }
};

/**
 * Enhanced mobile-safe image processing
 * Combines orientation fixing, optimization, and mobile-specific handling
 */
export const processMobileImage = async (file: File): Promise<File> => {
  if (!isMobileDevice()) {
    return file;
  }
  
  console.log('Mobile: Starting comprehensive mobile image processing');
  
  try {
    // Step 1: Optimize dimensions if needed
    let processedFile = await optimizeImageForMobile(file);
    
    // Step 2: Process for orientation and EXIF stripping
    processedFile = await processImageForMobile(processedFile);
    
    console.log('Mobile: Comprehensive processing complete');
    return processedFile;
  } catch (error) {
    console.error('Mobile: Error in comprehensive processing:', error);
    return file;
  }
};