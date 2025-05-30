'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { checkAuth, signOut } from '@/utils/authUtils';
import { generateStagedImage } from '@/utils/openaiService';
import { getUserCredits } from '@/utils/supabaseService';
import NoCreditsModal from '@/components/NoCreditsModal';
import { convertHeicToJpeg, isHeicImage } from '@/utils/imageConverter';

export default function ClientPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  // Define a more flexible type for the user state to handle Supabase User object
  const [user, setUser] = useState<any>(null);
  const [_listing, setListing] = useState(null);
  // Define proper type for photos array
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [roomType, setRoomType] = useState('living_room');
  const [styleNotes, setStyleNotes] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, _setUploading] = useState(false);
  const [_processingPhoto, setProcessingPhoto] = useState(false);
  const [processingError, setProcessingError] = useState('');
  
  // Queue for multiple photos
  const [photoQueue, setPhotoQueue] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Processing notification state
  const [showProcessingNotification, setShowProcessingNotification] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  
  // User credits state
  const [userCredits, setUserCredits] = useState<any>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  
  // Room type options
  const roomTypes = [
    { value: 'living_room', label: 'Living Room' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'dining_room', label: 'Dining Room' },
    { value: 'office', label: 'Home Office' },
    { value: 'outdoor', label: 'Outdoor Space' },
    { value: 'backyard', label: 'Backyard' },
    { value: 'fron yard', label: 'Front Yard' },
    { value: 'facede', label: 'Facade' },
    { value: 'pool', label: 'Pool' },
    { value: 'other', label: 'Other' }
  ];
  
  useEffect(() => {
    // Extract ID from URL path
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      const listingId = pathSegments[pathSegments.length - 1];
      setId(listingId);
    }
  }, []);
  
  // Function to fetch user credits
  async function fetchUserCredits(userId: string) {
    try {
      setCreditsLoading(true);
      const { data, error } = await getUserCredits(userId);
      
      if (error) throw error;
      
      setUserCredits(data);
    } catch (err) {
      console.error("Error fetching user credits:", err);
    } finally {
      setCreditsLoading(false);
    }
  }
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      try {
        // Check if user is authenticated
        const currentUser = await checkAuth();
        if (!currentUser) {
          router.push('/auth');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch user credits
        fetchUserCredits(currentUser.id);
        
        // Get listing details directly from Supabase
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();
        
        if (listingError) {
          setError('Listing not found');
          setIsLoading(false);
          return;
        }
        
        setListing(listingData);
        
        // Get photos for this listing
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .eq('listing_id', id)
          .order('created_at', { ascending: false });
        
        if (photosError) {
          console.error('Error fetching photos:', photosError);
        } else if (photosData) {
          setPhotos(photosData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading listing');
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [id, router]);
  
  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      try {
        // Check if the file is a HEIC/HEIF image and convert if needed
        if (isHeicImage(file)) {
          // Set a temporary filename to show conversion is happening
          setSelectedFileName(`Converting ${file.name}...`);
          
          // Convert HEIC to JPEG
          const convertedFile = await convertHeicToJpeg(file);
          setSelectedFile(convertedFile);
          setSelectedFileName(convertedFile.name);
          console.log('Converted HEIC image to JPEG:', convertedFile.name);
        } else {
          // For non-HEIC files, use as is
          setSelectedFile(file);
          setSelectedFileName(file.name);
        }
        
        setUploadError('');
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadError('Error processing image file. Please try a different format.');
        setSelectedFile(null);
        setSelectedFileName('');
      }
    }
  };
  
  // Handle room type selection
  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomType(e.target.value);
  };
  
  // Handle style notes input
  const handleStyleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStyleNotes(e.target.value);
  };
  
  // Check if user has credits
  const checkCredits = () => {
    if (!userCredits || (userCredits.photos_limit - userCredits.photos_used) <= 0) {
      setShowNoCreditsModal(true);
      return false;
    }
    return true;
  };
  
  // Add photo to queue
  const addPhotoToQueue = () => {
    if (!selectedFile) {
      setUploadError('Please select a photo first');
      return;
    }
    
    // Directly check for credits and show modal if needed
    if (!userCredits || (userCredits.photos_limit - userCredits.photos_used) <= 0) {
      setShowNoCreditsModal(true);
      return;
    }
    
    // Add the current photo to the queue
    const roomLabel = roomTypes.find(rt => rt.value === roomType)?.label || 'Unknown';
    setPhotoQueue([...photoQueue, {
      file: selectedFile,
      roomType: roomLabel,
      styleNotes: styleNotes
    }]);
    
    // Reset form for next photo
    setSelectedFile(null);
    setSelectedFileName('');
    setRoomType('living_room');
    setStyleNotes('');
    setUploadError('');
  };
  
  // Remove photo from queue
  const removeFromQueue = (index: number) => {
    const newQueue = [...photoQueue];
    newQueue.splice(index, 1);
    setPhotoQueue(newQueue);
  };
  
  // Process all photos in queue
  const processAllPhotos = async () => {
    if (photoQueue.length === 0) {
      setUploadError('Please add at least one photo to the queue');
      return;
    }
    
    // Check if user has credits before proceeding
    if (!checkCredits()) {
      return;
    }
    
    try {
      // Set loading states
      setIsSubmitting(true);
      setUploadError('');
      setProcessingError('');
      
      // Show processing notification
      setProcessingCount(photoQueue.length);
      setShowProcessingNotification(true);
      
      console.log(`Starting processing of ${photoQueue.length} photos for listing ID:`, id);
      
      // Process each photo in the queue one by one
      for (let i = 0; i < photoQueue.length; i++) {
        const currentPhoto = photoQueue[i];
        setProcessingPhoto(true);
        
        try {
          // Upload the file to Supabase Storage
          const fileExt = currentPhoto.file.name.split('.').pop();
          const fileName = `photo_${Date.now()}.${fileExt}`;
          const filePath = fileName;
          
          console.log(`Processing photo ${i+1}/${photoQueue.length}:`, filePath);
          
          // 1. Upload file to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('original-photos')
            .upload(filePath, currentPhoto.file);
            
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
          
          // 2. Get the public URL
          const { data: urlData } = supabase.storage
            .from('original-photos')
            .getPublicUrl(filePath);
            
          if (!urlData || !urlData.publicUrl) {
            throw new Error('Failed to get public URL');
          }
          
          const publicUrl = urlData.publicUrl;
          
          // Save to database with minimal fields to avoid errors
          const { data: photoData, error: dbError } = await supabase
            .from('photos')
            .insert({
              listing_id: id,
              user_id: user.id,
              original_url: publicUrl,
              room_type: currentPhoto.roomType,
              style_notes: currentPhoto.styleNotes,
              processing_status: 'processing'
            })
            .select();
          
          if (dbError) {
            console.error('Database error:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
          }
          
          // Get the photo ID from the inserted record
          const photoId = photoData[0].id;
          
          // Call OpenAI API to generate a staged image
          console.log('Calling OpenAI API to generate staged image');
          try {
            // Show a toast notification that we're processing
            toast.loading('Generating staged image...', { id: 'generating-image' });
            
            const result = await generateStagedImage(publicUrl, currentPhoto.roomType, currentPhoto.styleNotes, user.id);
            
            // Success - dismiss the loading toast
            toast.dismiss('generating-image');
            toast.success('Image generated successfully!');
            
            // Get the staged image URL from the result
            const stagedImageUrl = result.imageUrl;
            
            // Update the photo record with the staged image URL
            const { error: updateError } = await supabase
              .from('photos')
              .update({
                staged_url: stagedImageUrl,
                processing_status: 'completed'
              })
              .eq('id', photoId);
              
            if (updateError) {
              console.error('Error updating photo with staged image:', updateError);
              throw new Error(`Failed to update photo: ${updateError.message}`);
            }
            
            console.log(`Successfully processed photo ${i+1}/${photoQueue.length}`);
          } catch (aiError) {
            console.error('Error in AI processing:', aiError);
            
            // Dismiss any loading toast
            toast.dismiss('generating-image');
            
            // Check if we got a no credits error
            if (aiError instanceof Error && aiError.message === 'NO_CREDITS_REMAINING') {
              console.log('User has no credits remaining');
              setShowNoCreditsModal(true);
              setProcessingPhoto(false);
              setShowProcessingNotification(false);
              return; // Stop processing queue
            }
            
            // Show appropriate error message based on the error
            if (aiError instanceof Error) {
              if (aiError.message.includes('API key')) {
                toast.error('OpenAI API configuration error. Please contact support.');
              } else if (aiError.message.includes('rate limit')) {
                toast.error('Rate limit exceeded. Please try again later.');
              } else {
                toast.error(`Image generation failed: ${aiError.message}`);
              }
            } else {
              toast.error('Failed to generate image. Please try again.');
            }
            
            // Update the photo to mark it as failed
            await supabase
              .from('photos')
              .update({ processing_status: 'failed' })
              .eq('id', photoId);
            console.log(`Failed to process photo ${i+1}/${photoQueue.length}`);
          }
          
          // Refresh photos list after each photo
          const { data: newPhotos } = await supabase
            .from('photos')
            .select('*')
            .eq('listing_id', id)
            .order('created_at', { ascending: false });
          
          if (newPhotos) {
            setPhotos(newPhotos);
          }
          
        } catch (photoError) {
          console.error(`Error processing photo ${i+1}:`, photoError);
          // Continue with the next photo even if this one failed
        }
      }
      
      // Clear the queue after processing all photos
      setPhotoQueue([]);
      
    } catch (err: unknown) {
      console.error('Error processing photos:', err);
      setProcessingError(err instanceof Error ? err.message : 'An error occurred');
      setUploadError(err instanceof Error ? err.message : 'Failed to process photos');
    } finally {
      setProcessingPhoto(false);
      setIsSubmitting(false);
      setShowProcessingNotification(false);
    }
  };
  
  // Process a single photo (for backward compatibility)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _processPhotoWithAI = async () => {
    if (!selectedFile) {
      setUploadError('Please select a photo first');
      return;
    }
    
    // Add to queue and process immediately
    const roomLabel = roomTypes.find(rt => rt.value === roomType)?.label || 'Unknown';
    setPhotoQueue([{
      file: selectedFile,
      roomType: roomLabel,
      styleNotes: styleNotes
    }]);
    
    // Process all photos (which is just this one)
    setTimeout(() => processAllPhotos(), 0);
  };
  
  // Handle photo deletion
  const handleDeletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
        
      if (error) {
        throw error;
      }
      
      // Update the photos list
      setPhotos(photos.filter(photo => photo.id !== photoId));
      
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            <img 
              src="/images/3.png" 
              alt="StageMate Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
          <div className="flex items-center">
            <div className="mr-6 flex items-center">
              <div className="bg-[#f1f5f9] dark:bg-[#27272a] px-4 py-2 rounded-md flex items-center">
                <span className="text-[#2563eb] dark:text-[#60a5fa] font-medium mr-1">
                  {creditsLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    userCredits ? Math.max(0, userCredits.photos_limit - userCredits.photos_used) : 0
                  )}
                </span>
                <span className="text-[#64748b] dark:text-[#94a3b8] text-sm">
                  {userCredits && (userCredits.photos_limit - userCredits.photos_used) === 1 ? 'Credit' : 'Credits'} Remaining
                </span>
              </div>
              <Link href="/dashboard/upgrade" className="ml-2 text-sm text-[#2563eb] dark:text-[#60a5fa] hover:underline">
                Add Credits
              </Link>
            </div>
            <nav className="flex items-center">
              <Link href="/dashboard" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
                Dashboard
              </Link>
              <button 
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className="bg-[#f1f5f9] dark:bg-[#27272a] hover:bg-[#e2e8f0] dark:hover:bg-[#3f3f46] text-[#64748b] dark:text-[#cbd5e1] px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 relative">
      {/* No Credits Modal */}
      <NoCreditsModal 
        isOpen={showNoCreditsModal} 
        onClose={() => setShowNoCreditsModal(false)} 
      />
      
      {/* Processing Notification */}
      {showProcessingNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#27272a] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <svg className="animate-spin h-8 w-8 text-[#2563eb] mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white">Processing Images with AI</h3>
            </div>
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-6">
              We&apos;re currently processing {processingCount} image{processingCount !== 1 ? 's' : ''} with StageMateAI. This may take a few minutes.
            </p>
            <div className="flex justify-center items-center">
              <p className="text-sm font-bold text-red-600 dark:text-red-500">
                WARNING! DO NOT CLOSE this window. Images Processing
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl p-6 mt-4">
          <h4 className="font-medium text-[#1d2939] dark:text-white mb-3">Step 1: Select a Photo</h4>
          <div className="mb-6">
            <label className="block mb-2 text-sm text-[#64748b] dark:text-[#94a3b8]">
              Choose a photo to transform
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-[#64748b] dark:text-[#cbd5e1] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            />
            {selectedFileName && (
              <p className="mt-2 text-sm text-[#64748b] dark:text-[#94a3b8]">
                Selected: {selectedFileName}
              </p>
            )}
          </div>
          
          <h4 className="font-medium text-[#1d2939] dark:text-white mb-3">Step 2: Room Details</h4>
          <div className="mb-4">
            <label className="block mb-2 text-sm text-[#64748b] dark:text-[#94a3b8]">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={handleRoomTypeChange}
              className="w-full px-3 py-2 bg-white dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md shadow-sm text-[#1d2939] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              disabled={uploading}
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm text-[#64748b] dark:text-[#94a3b8]">
              Style Notes (Optional)
            </label>
            <textarea
              value={styleNotes}
              onChange={handleStyleNotesChange}
              placeholder="e.g., Modern coastal, Minimalist, Scandinavian, etc."
              className="w-full px-3 py-2 bg-white dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md shadow-sm text-[#1d2939] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
              rows={3}
              disabled={uploading}
            ></textarea>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={addPhotoToQueue}
              disabled={!selectedFile || uploading || isSubmitting}
              className="w-full bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Queue
            </button>
            
            <button
              onClick={processAllPhotos}
              disabled={photoQueue.length === 0 || uploading || isSubmitting || !userCredits || (userCredits.photos_limit - userCredits.photos_used) <= 0}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : `Transform All (${photoQueue.length})`}
            </button>
          </div>
          
          {uploadError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {uploadError}
            </p>
          )}
          
          {processingError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {processingError}
            </p>
          )}
          
          {/* Photo Queue Display */}
          {photoQueue.length > 0 && (
            <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md p-2">
              <h5 className="text-sm font-medium text-[#1d2939] dark:text-white mb-2">
                Photo Queue ({photoQueue.length})
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {photoQueue.map((queueItem, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-[#27272a] rounded">
                    <div className="flex-1 truncate">
                      <span className="font-medium">{queueItem.file.name}</span>
                      <span className="text-[#64748b] dark:text-[#94a3b8] ml-2">{queueItem.roomType}</span>
                    </div>
                    <button 
                      onClick={() => removeFromQueue(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      disabled={isSubmitting}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Photos Display */}
        <div className="bg-[#f8fafc] dark:bg-[#23272f] rounded-xl overflow-hidden shadow-md">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo.id} className="grid grid-cols-2 gap-2">
                <div className="p-2">
                  <div className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8] mb-1">
                    Original
                  </div>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                    <img 
                      src={photo.original_url} 
                      alt="Original" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8] mb-1">
                    AI Staged
                  </div>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                    {photo.processing_status === 'completed' && photo.staged_url ? (
                      <>
                        <img 
                          src={photo.staged_url} 
                          alt="AI Staged" 
                          className="w-full h-full object-cover"
                        />
                        <a 
                          href={photo.staged_url}
                          download={`staged-${photo.id}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 bg-[#2563eb] hover:bg-[#1e40af] text-white p-2 rounded-full shadow-lg transition-colors"
                          title="Download high-quality image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </>
                    ) : photo.processing_status === 'failed' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-[#64748b] dark:text-[#94a3b8] text-xs mt-1">
                            Processing failed
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="animate-spin h-5 w-5 mx-auto text-[#2563eb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-[#64748b] dark:text-[#94a3b8] text-xs mt-1">
                            Processing...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#1d2939] dark:text-white">
                      {photo.room_type}
                    </span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {photo.style_notes && (
                    <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                      Style: {photo.style_notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#94a3b8] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[#64748b] dark:text-[#94a3b8]">
                No photos yet. Upload a photo to get started.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/dashboard" className="text-[#2563eb] hover:text-[#1e40af] dark:text-[#3b82f6] dark:hover:text-[#60a5fa]">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  </div>
</div>
  );
}
