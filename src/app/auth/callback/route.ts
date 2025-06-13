import { supabase } from '@/utils/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // If there's no code, redirect to auth page
  if (!code) {
    console.error('Auth callback: No code parameter found');
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=missing_code`);
  }

  try {
    
    // Exchange the code for a session (we've already checked that code is not null above)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string);
    
    if (error) {
      console.error('Auth callback: Error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent(error.message)}`);
    }
    
    // Get the user session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if this is a new user
      const isNewUser = user.app_metadata.provider === "google" && 
                       user.created_at && user.last_sign_in_at &&
                       new Date(user.created_at).getTime() === 
                       new Date(user.last_sign_in_at).getTime();
      
      if (isNewUser) {
        console.log("Auth callback: New Google user detected, creating user records");
        
        try {
          // Create user records in our custom tables
          const response = await fetch(`${requestUrl.origin}/api/create-user-records`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0]
            }),
          });
          
          const result = await response.json();
          console.log('User records creation result:', result);
          
          if (!response.ok) {
            console.error('Failed to create user records:', result);
          }
        } catch (error) {
          console.error('Error creating user records:', error);
          // Continue despite error - user was created in auth
        }
      }
    }
    
    // Successful authentication, redirect to dashboard
    console.log('Auth callback: Successfully exchanged code for session, redirecting to dashboard');
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  } catch (err) {
    console.error('Auth callback: Unexpected error:', err);
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected_error`);
  }
}
