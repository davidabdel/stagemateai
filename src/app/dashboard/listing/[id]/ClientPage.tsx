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
    
    // Add to queue
    setPhotoQueue([...photoQueue, {
      file: selectedFile,
      roomType,
      styleNotes
    }]);
    
    // Reset form
    setSelectedFile(null);
    setSelectedFileName('');
    setRoomType('living_room');
    setStyleNotes('');
    
    toast.success('Photo added to queue');
  };
  
  // Remove photo from queue
  const removeFromQueue = (index: number) => {
    const newQueue = [...photoQueue];
    newQueue.splice(index, 1);
    setPhotoQueue(newQueue);
  };
  
  // Process all photos in queue
  const processQueue = async () => {
    if (photoQueue.length === 0) return;
    
    if (!checkCredits()) return;
    
    setIsSubmitting(true);
    setProcessingCount(photoQueue.length);
    setShowProcessingNotification(true);
    
    // Process each photo in the queue
    for (const item of photoQueue) {
      try {
        await handleUploadAndProcess(item.file, item.roomType, item.styleNotes);
        // Decrement the processing count
        setProcessingCount(prev => prev - 1);
      } catch (error) {
        console.error('Error processing queued photo:', error);
        // Continue with next photo even if one fails
      }
    }
    
    // Clear the queue after processing
    setPhotoQueue([]);
    setIsSubmitting(false);
    
    // Hide notification after a delay
    setTimeout(() => {
      setShowProcessingNotification(false);
    }, 3000);
  };
  
  // Handle upload and processing
  const handleUploadAndProcess = async (file: File, selectedRoomType: string, notes: string) => {
    try {
      setProcessingPhoto(true);
      setProcessingError('');
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${id}_${timestamp}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file);
      
      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('property-photos')
        .getPublicUrl(fileName);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      const originalUrl = publicUrlData.publicUrl;
      
      // Insert record into photos table
      const { data: photoData, error: insertError } = await supabase
        .from('photos')
        .insert([
          {
            listing_id: id,
            original_url: originalUrl,
            room_type: selectedRoomType,
            style_notes: notes,
            processing_status: 'processing',
            user_id: user.id
          }
        ])
        .select();
      
      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }
      
      if (!photoData || photoData.length === 0) {
        throw new Error('Failed to insert photo record');
      }
      
      const photoId = photoData[0].id;
      
      // Add the new photo to the state
      setPhotos(prevPhotos => [photoData[0], ...prevPhotos]);
      
      // Generate the staged image
      const result = await generateStagedImage(
        originalUrl,
        selectedRoomType,
        notes,
        user.id
      );
      
      if (result.error) {
        // Update the photo record to mark as failed
        await supabase
          .from('photos')
          .update({
            processing_status: 'failed',
            error_message: result.error
          })
          .eq('id', photoId);
        
        // Update the photo in the state
        setPhotos(prevPhotos => 
          prevPhotos.map(photo => 
            photo.id === photoId 
              ? { ...photo, processing_status: 'failed', error_message: result.error } 
              : photo
          )
        );
        
        throw new Error(`Image generation failed: ${result.error}`);
      }
      
      // Update the photo record with the staged image URL
      const { error: updateError } = await supabase
        .from('photos')
        .update({
          staged_url: result.generatedImageUrl,
          processing_status: 'completed'
        })
        .eq('id', photoId);
      
      if (updateError) {
        console.error('Error updating photo record:', updateError);
      }
      
      // Update the photo in the state
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, staged_url: result.generatedImageUrl, processing_status: 'completed' } 
            : photo
        )
      );
      
      // Update user credits display
      if (result.photosRemaining !== undefined) {
        setUserCredits(prevCredits => ({
          ...prevCredits,
          credits_remaining: result.photosRemaining
        }));
      }
      
      // Fetch updated user credits
      fetchUserCredits(user.id);
      
      return photoId;
    } catch (err: any) {
      console.error('Error in upload and process:', err);
      setProcessingError(err.message || 'An error occurred during processing');
      throw err;
    } finally {
      setProcessingPhoto(false);
    }
  };
  
  // Handle single photo upload and process
  const handleSingleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a photo first');
      return;
    }
    
    if (!checkCredits()) return;
    
    try {
      setIsSubmitting(true);
      setProcessingCount(1);
      setShowProcessingNotification(true);
      
      await handleUploadAndProcess(selectedFile, roomType, styleNotes);
      
      // Reset form
      setSelectedFile(null);
      setSelectedFileName('');
      setRoomType('living_room');
      setStyleNotes('');
      
      toast.success('Photo processed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process photo');
    } finally {
      setIsSubmitting(false);
      setProcessingCount(0);
      
      // Hide notification after a delay
      setTimeout(() => {
        setShowProcessingNotification(false);
      }, 3000);
    }
  };
  
  // Handle photo deletion
  const handleDeletePhoto = async (photoId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
      
      // Update state
      setPhotos(photos.filter(photo => photo.id !== photoId));
      
      toast.success('Photo deleted successfully');
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Failed to delete photo');
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb] mx-auto"></div>
          <p className="mt-4 text-[#1d2939] dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-[#2563eb] hover:bg-[#1e40af] text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }