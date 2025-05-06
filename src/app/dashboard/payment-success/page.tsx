"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

// Create a client component that uses useSearchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    async function updateUserAccount() {
      console.log('=== PAYMENT SUCCESS PAGE LOADED ===');
      try {
        // Get the session ID from the URL
        const sessionId = searchParams.get('session_id');
        setDebugInfo(prev => ({ ...prev, sessionId }));
        
        if (!sessionId) {
          console.error('No session ID provided in URL');
          setError('No session ID provided');
          setIsLoading(false);
          return;
        }
        
        // HARDCODED VALUES FOR TESTING
        // In production, these would come from your Stripe session
        const userId = 'e745a66a-5743-4112-a611-23edc9bd1d6f'; // Replace with actual user ID
        const planType = 'agency';
        const creditsToAdd = 300;
        
        setDebugInfo(prev => ({
          ...prev,
          userId,
          planType,
          creditsToAdd
        }));
        
        // Get current user data for display purposes only
        const { data: userData, error: userError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        setDebugInfo(prev => ({
          ...prev,
          userData,
          userError
        }));
        
        // Use the server-side API to update the user's account
        // This bypasses RLS policies
        const response = await fetch('/api/admin/update-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            planType,
            creditsToAdd
          }),
        });
        
        const result = await response.json();
        setDebugInfo(prev => ({
          ...prev,
          apiResponse: result
        }));
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update account');
        }
        
        // Set success state
        setSuccess(true);
      } catch (err: any) {
        console.error('Error processing payment:', err);
        setError(err.message || 'Failed to process payment');
        setDebugInfo(prev => ({ ...prev, error: err.message }));
      } finally {
        setIsLoading(false);
      }
    }
    
    updateUserAccount();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        {isLoading ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Processing Payment</h1>
            <p className="text-gray-600 mb-4">Please wait while we process your payment...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-4">Failed to update your subscription automatically.</p>
            <div className="mb-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-60 text-xs">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            <Link href="/admin/debug" className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mb-2">
              Update Account Manually
            </Link>
            <p className="text-sm text-gray-500 mb-4">Use the admin debug page to manually update your account.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-2"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full text-blue-500 hover:text-blue-600 font-semibold py-2 px-4 rounded border border-blue-500 hover:border-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your account has been upgraded successfully.</p>
            <div className="mb-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-60 text-xs">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component that wraps the content in a Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading Payment Details</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
