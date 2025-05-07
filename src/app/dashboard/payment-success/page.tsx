'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { checkAuth } from '@/utils/authUtils';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log('Verifying payment with session ID:', sessionId);
        
        // First, ensure we have the current authenticated user
        const currentUser = await checkAuth();
        if (!currentUser) {
          console.log('No authenticated user found, attempting to get session');
          // Try to get the current session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.error('No active session found');
            setError('Authentication session expired. Please log in again after redirection.');
            setLoading(false);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
              router.push('/auth?redirect=dashboard');
            }, 3000);
            return;
          }
        }
        
        // Get the current user ID
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        
        console.log('Current authenticated user ID:', userId);
        
        // Call your API to verify the payment and update user subscription
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            sessionId,
            userId // Include the current user ID to ensure subscription is applied to the correct account
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to verify payment: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Payment verification response:', data);
        
        // Refresh user data from the database to ensure we have the latest subscription info
        await refreshUserData(userId);
        
        setSuccess(true);
        setLoading(false);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    // Function to refresh user data from the database
    const refreshUserData = async (userId: string | undefined) => {
      if (!userId) return;
      
      try {
        // Refresh user usage data
        const { error: usageError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (usageError) {
          console.error('Error refreshing user usage data:', usageError);
        }
        
        // Refresh consolidated users data
        const { error: consolidatedError } = await supabase
          .from('consolidated_users')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (consolidatedError) {
          console.error('Error refreshing consolidated user data:', consolidatedError);
        }
        
        console.log('User data refreshed successfully');
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {loading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Processing your payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Payment Verification Failed</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 mt-4 text-white bg-primary rounded hover:bg-primary/90"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your subscription. Your account has been upgraded.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      )}
    </div>
  );
}
