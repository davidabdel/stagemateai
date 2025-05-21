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
  
  // Extract ID from URL path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      const listingId = pathSegments[pathSegments.length - 1];
      setId(listingId);
    }
  }, []);
  
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
  
  // No need to extract ID from URL as it's passed as a prop
  
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
    // ID is now passed as a prop and will always be available
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
          setSelectedFile(file);
          setSelectedFileName(file.name);
        }
        
        setUploadError('');
      } catch (err) {
        console.error('Error handling file selection:', err);
        setUploadError('Error processing the selected file. Please try another image.');
        setSelectedFile(null);
        setSelectedFileName('');
      }
    }
  };
  
  // Add the current photo to the queue
  const addPhotoToQueue = () => {
    if (!selectedFile) {
      setUploadError('Please select a photo first');
      return;
    }
    
    // Check if we have enough credits
    if (userCredits && (userCredits.photos_limit - userCredits.photos_used) <= 0) {
      setShowNoCreditsModal(true);
      return;
    }
    
    // Add the current photo to the queue
    setPhotoQueue([...photoQueue, {
      file: selectedFile,
      fileName: selectedFileName,
      roomType,
      styleNotes
    }]);
    
    // Reset the form
    setSelectedFile(null);
    setSelectedFileName('');
    setRoomType('living_room');
    setStyleNotes('');
    
    // Show a toast notification
    toast.success('Photo added to queue');
  };
  
  // Remove a photo from the queue
  const removeFromQueue = (index: number) => {
    const newQueue = [...photoQueue];
    newQueue.splice(index, 1);
    setPhotoQueue(newQueue);
  };
  
  // Upload a photo to Supabase storage
  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };
  
  // Process a single photo from the queue
  const processPhoto = async (queueItem: any, index: number) => {
    try {
      setProcessingCount(prev => prev + 1);
      setShowProcessingNotification(true);
      
      // Upload the photo to Supabase storage
      const imageUrl = await uploadPhotoToStorage(queueItem.file);
      
      // Generate the staged image using OpenAI
      const generatedImageData = await generateStagedImage(
        imageUrl,
        queueItem.roomType,
        queueItem.styleNotes,
        user.id
      );
      
      if (!generatedImageData || !generatedImageData.imageUrl) {
        throw new Error('Failed to generate image');
      }
      
      // Save the photo to the database
      const { error: saveError } = await supabase
        .from('photos')
        .insert([
          {
            listing_id: id,
            user_id: user.id,
            original_url: imageUrl,
            staged_url: generatedImageData.imageUrl,
            room_type: queueItem.roomType,
            style_notes: queueItem.styleNotes
          }
        ]);
      
      if (saveError) throw saveError;
      
      // Update the photos list with the new photo
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: false });
      
      if (photosError) throw photosError;
      
      setPhotos(photosData || []);
      
      // Fetch updated user credits
      fetchUserCredits(user.id);
      
      // Remove the processed photo from the queue
      const newQueue = [...photoQueue];
      newQueue.splice(index, 1);
      setPhotoQueue(newQueue);
      
      // Show a success notification
      toast.success('Photo processed successfully');
      
    } catch (error) {
      console.error('Error processing photo:', error);
      setProcessingError(`Error processing photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Error processing photo. Please try again.');
    } finally {
      setProcessingCount(prev => prev - 1);
      if (processingCount <= 1) {
        setShowProcessingNotification(false);
      }
    }
  };
  
  // Process all photos in the queue
  const processAllPhotos = async () => {
    if (photoQueue.length === 0) {
      toast.error('No photos in queue');
      return;
    }
    
    // Check if we have enough credits
    if (userCredits && (userCredits.photos_limit - userCredits.photos_used) < photoQueue.length) {
      setShowNoCreditsModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process each photo in the queue
      for (let i = 0; i < photoQueue.length; i++) {
        await processPhoto(photoQueue[i], i);
      }
      
      // Clear the queue
      setPhotoQueue([]);
      
    } catch (error) {
      console.error('Error processing photos:', error);
      setProcessingError(`Error processing photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Error processing photos. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a photo
  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
      
      // Update the photos list
      setPhotos(photos.filter(photo => photo.id !== photoId));
      
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error deleting photo');
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-500 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Listing Photos</h1>
          <p className="text-gray-600">Upload and generate staged photos for your listing</p>
        </div>
        
        {/* Credits display */}
        <div className="mt-4 md:mt-0 bg-gray-100 p-3 rounded-lg">
          {creditsLoading ? (
            <p>Loading credits...</p>
          ) : userCredits ? (
            <div>
              <p className="font-medium">
                Photos: {userCredits.photos_used} / {userCredits.photos_limit} used
              </p>
              <p className="text-sm text-gray-600">
                {userCredits.photos_limit - userCredits.photos_used} remaining
              </p>
            </div>
          ) : (
            <p>Unable to load credits</p>
          )}
        </div>
      </div>
      
      {/* Photo upload form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Photo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Select Photo</label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                Choose File
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />
              </label>
              <span className="ml-3 text-gray-600">
                {selectedFileName || "No file selected"}
              </span>
            </div>
            {uploadError && (
              <p className="text-red-500 mt-2">{uploadError}</p>
            )}
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Room Type</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                disabled={isSubmitting}
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Style Notes (Optional)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Modern, Minimalist, Rustic"
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
            onClick={addPhotoToQueue}
            disabled={!selectedFile || isSubmitting}
          >
            Add to Queue
          </button>
        </div>
      </div>
      
      {/* Photo queue */}
      {photoQueue.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Photo Queue ({photoQueue.length})</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
              onClick={processAllPhotos}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Process All Photos'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photoQueue.map((item, index) => (
              <div key={index} className="border rounded p-3 relative">
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => removeFromQueue(index)}
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className="font-medium truncate">{item.fileName}</p>
                <p className="text-sm text-gray-600">{roomTypes.find(rt => rt.value === item.roomType)?.label || item.roomType}</p>
                {item.styleNotes && <p className="text-sm text-gray-500">{item.styleNotes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Processing error */}
      {processingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{processingError}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setProcessingError('')}
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}
      
      {/* Photos grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Listing Photos ({photos.length})</h2>
        
        {photos.length === 0 ? (
          <p className="text-gray-600">No photos yet. Upload some photos to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="relative">
                    <img 
                      src={photo.original_url} 
                      alt="Original" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                      Original
                    </div>
                  </div>
                  <div className="relative">
                    <img 
                      src={photo.staged_url} 
                      alt="Staged" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                      Staged
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {roomTypes.find(rt => rt.value === photo.room_type)?.label || photo.room_type}
                      </p>
                      {photo.style_notes && (
                        <p className="text-sm text-gray-600">{photo.style_notes}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(photo.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deletePhoto(photo.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Processing notification */}
      {showProcessingNotification && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
            <p>Processing {processingCount} photo(s)...</p>
          </div>
        </div>
      )}
      
      {/* No credits modal */}
      {showNoCreditsModal && (
        <NoCreditsModal 
          onClose={() => setShowNoCreditsModal(false)}
          onUpgrade={() => router.push('/dashboard/upgrade')}
        />
      )}
    </div>
  );
}