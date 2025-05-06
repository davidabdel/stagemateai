import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    console.log('Getting current user');
    
    // Try to get the user from Clerk
    const auth = getAuth(req);
    console.log('Clerk auth:', auth);
    
    const userId = auth?.userId;
    
    if (!userId) {
      // Try to get user from Supabase as fallback
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const supabaseUser = session.session.user;
        console.log('Supabase user:', { id: supabaseUser.id, email: supabaseUser.email });
        
        return NextResponse.json({
          id: supabaseUser.id,
          email: supabaseUser.email
        });
      }
      
      // Try to get from cookies as last resort
      const cookieUserId = req.cookies.get('userId')?.value;
      if (cookieUserId) {
        console.log('Found userId in cookies:', cookieUserId);
        
        // Get user data from database
        const { data: userData } = await supabase
          .from('consolidated_users')
          .select('*')
          .eq('user_id', cookieUserId)
          .single();
          
        if (userData) {
          return NextResponse.json({
            id: cookieUserId,
            ...userData
          });
        }
      }
      
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get additional user data from database
    const { data: userData } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    return NextResponse.json({
      id: userId,
      ...userData
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
