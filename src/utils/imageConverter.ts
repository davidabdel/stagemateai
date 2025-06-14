import heicConvert from 'heic-convert';
import { processMobileImage, isMobileDevice } from './mobileImageProcessor';

/**
 * Converts HEIC/HEIF images to JPEG format
 * @param file The HEIC/HEIF file to convert
 * @returns A Promise that resolves to a File object in JPEG format
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // Check if the file is a HEIC/HEIF image
  if (!file.name.toLowerCase().endsWith('.heic') && 
      !file.name.toLowerCase().endsWith('.heif') && 
      file.type !== 'image/heic' && 
      file.type !== 'image/heif') {
    // If not a HEIC/HEIF file, apply mobile processing if needed
    return processMobileImage(file);
  }

  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert HEIC to JPEG using heic-convert
    const jpegBuffer = await heicConvert({
      buffer: Buffer.from(arrayBuffer),
      format: 'JPEG',
      quality: isMobileDevice() ? 0.8 : 0.9 // Lower quality for mobile to prevent errors
    });
    
    // Create a new File object with the converted JPEG data
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    const jpegFile = new File([jpegBuffer], fileName, { type: 'image/jpeg' });
    
    // Apply mobile processing to the converted file if on mobile
    return processMobileImage(jpegFile);
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error);
    // If conversion fails, apply mobile processing to original file
    return processMobileImage(file);
  }
}

/**
 * Checks if a file is a HEIC/HEIF image
 * @param file The file to check
 * @returns boolean indicating if the file is a HEIC/HEIF image
 */
export function isHeicImage(file: File): boolean {
  return file.name.toLowerCase().endsWith('.heic') || 
         file.name.toLowerCase().endsWith('.heif') || 
         file.type === 'image/heic' || 
         file.type === 'image/heif';
}
