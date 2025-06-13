import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { checkAdminAuth } from '@/utils/authUtils';

export async function GET(req: NextRequest) {
  try {
    console.log('Admin-new auth check API called');
    
    // Check if user is admin with strict verification
    const { isAdmin, user } = await checkAdminAuth();
    
    if (!isAdmin) {
      console.error('Unauthorized access attempt to admin-new API:', user?.email || 'unknown user');
      return NextResponse.json({ 
        error: 'Unauthorized. Only david@uconnect.com.au can access admin features.',
        authorized: false 
      }, { status: 403 });
    }
    
    // Double-check that the email is exactly david@uconnect.com.au
    if (user?.email !== 'david@uconnect.com.au') {
      console.error('Email mismatch in admin-new auth check:', user?.email);
      return NextResponse.json({ 
        error: 'Access denied. Email verification failed.',
        authorized: false 
      }, { status: 403 });
    }
    
    console.log('Admin-new access verified for:', user?.email);
    
    return NextResponse.json({ 
      message: 'Admin access verified',
      authorized: true,
      user: {
        id: user?.id,
        email: user?.email
      }
    });
  } catch (error: any) {
    console.error('Error in admin-new auth check:', error);
    return NextResponse.json(
      { error: 'Authentication error', details: error.message, authorized: false },
      { status: 500 }
    );
  }
}
