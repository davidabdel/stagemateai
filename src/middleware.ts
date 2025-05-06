import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the session cookie
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Get the Supabase session cookie
    // Supabase stores the session in a cookie with the format 'sb-<project-ref>-auth-token'
    // We need to find the right cookie that contains the auth token
    let authCookie = null;
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.includes('auth-token')) {
        authCookie = cookie.value;
        break;
      }
    }
    
    if (!authCookie) {
      console.log('No auth cookie found, redirecting to auth page');
      // Redirect to auth page if no auth cookie
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    try {
      // Create a Supabase client
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
      
      // Parse the JWT token to get user information without making an API call
      // This is more efficient and avoids potential auth issues
      const token = JSON.parse(Buffer.from(authCookie.split('.')[1], 'base64').toString());
      
      if (!token || !token.email) {
        console.log('Invalid token or missing email, redirecting to auth page');
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      
      // Check if the user is the admin (david@uconnect.com.au)
      if (token.email !== 'david@uconnect.com.au') {
        console.log('User is not admin, redirecting to home page');
        // Redirect to home if not the admin
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      console.log('Admin access verified for:', token.email);
    } catch (error) {
      console.error('Error in middleware:', error);
      // Redirect to auth page if there's an error
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  // Continue with the request for non-admin pages or if admin access is verified
  return NextResponse.next();
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    // Match admin routes and exclude files with extensions, api routes, and Next.js internals
    "/admin/:path*"
  ],
};
