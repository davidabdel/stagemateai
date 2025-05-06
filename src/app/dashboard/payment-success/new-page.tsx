"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function updateUserAccount() {
      try {
        // Get the session ID from the URL
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError('No session ID provided');
          setIsLoading(false);
          return;
        }
        
        console.log('Processing payment for session:', sessionId);
        
        // Get the current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('User not authenticated');
          setIsLoading(false);
          return;
        }
        
        const userId = user.id;
        console.log('User ID:', userId);
        
        // Hardcoded values for testing - in production these would come from your Stripe session
        const planType = 'agency';
        const creditsToAdd = 300;
        
        // Get current user data
        const { data: userData, error: userError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {
          throw new Error(`Error fetching user data: ${userError.message}`);
        }
        
        // Calculate new credits
        const currentCredits = userData?.photos_limit || 0;
        const newCredits = currentCredits + creditsToAdd;
        
        console.log('Updating user account:', {
          userId,
          planType,
          currentCredits,
          newCredits
        });
        
        // Update user_usage table
        const { error: updateError } = await supabase
          .from('user_usage')
          .upsert({
            user_id: userId,
            photos_limit: newCredits,
            photos_used: userData?.photos_used || 0,
            plan_type: planType,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (updateError) {
          throw new Error(`Error updating user account: ${updateError.message}`);
        }
        
        // Also update consolidated_users table
        const { data: consolidatedUser } = await supabase
          .from('consolidated_users')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (consolidatedUser) {
          // Update existing record
          await supabase
            .from('consolidated_users')
            .update({
              plan_type: planType,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        } else {
          // Create new record
          await supabase
            .from('consolidated_users')
            .insert({
              user_id: userId,
              email: user.email || 'user@example.com',
              plan_type: planType,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
        
        console.log('Successfully updated user account');
        setSuccess(true);
      } catch (err: any) {
        console.error('Error processing payment:', err);
        setError(err.message || 'Failed to process payment');
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
            <p className="text-gray-600 mb-4">Failed to update your subscription. Please contact support.</p>
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
