import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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
    // Create a Supabase client with the cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session (we've already checked that code is not null above)
    const { error } = await supabase.auth.exchangeCodeForSession(code as string);
    
    if (error) {
      console.error('Auth callback: Error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent(error.message)}`);
    }
    
    // Successful authentication, redirect to dashboard
    console.log('Auth callback: Successfully exchanged code for session, redirecting to dashboard');
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  } catch (err) {
    console.error('Auth callback: Unexpected error:', err);
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected_error`);
  }
}
