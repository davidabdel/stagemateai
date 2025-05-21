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

  // Rest of the component code...
  
  // Return statement at the end
  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content goes here */}
        <div className="mt-6">
          <Link href="/dashboard" className="text-[#2563eb] hover:text-[#1e40af] dark:text-[#3b82f6] dark:hover:text-[#60a5fa]">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}