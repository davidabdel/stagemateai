import heicConvert from 'heic-convert';

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
    // If not a HEIC/HEIF file, return the original file
    return file;
  }

  try {
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert HEIC to JPEG using heic-convert
    const jpegBuffer = await heicConvert({
      buffer: Buffer.from(arrayBuffer),
      format: 'JPEG',
      quality: 0.9 // Set the quality of the output JPEG (0-1)
    });
    
    // Create a new File object with the converted JPEG data
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    const jpegFile = new File([jpegBuffer], fileName, { type: 'image/jpeg' });
    
    return jpegFile;
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error);
    // If conversion fails, return the original file
    return file;
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
