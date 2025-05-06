import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the session cookie
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    // Get the session from the request cookie
    const authCookie = request.cookies.get('sb-auth-token')?.value;
    
    if (!authCookie) {
      // Redirect to login if no auth cookie
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      // Use the cookie to get the user
      supabase.auth.setSession({
        access_token: authCookie,
        refresh_token: '',
      });
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // Redirect to login if error or no user
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Check if the user is the admin (david@uconnect.com.au)
      if (user.email !== 'david@uconnect.com.au') {
        // Redirect to home if not the admin
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      // Redirect to login if there's an error
      return NextResponse.redirect(new URL('/login', request.url));
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
