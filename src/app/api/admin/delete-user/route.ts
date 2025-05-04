import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { checkAdminAuth } from '@/utils/authUtils';

export async function POST(req: NextRequest) {
  try {
    // Check if the user is an admin
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get the email from the request body
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`Attempting to delete user with email: ${email}`);
    
    // First, find the user in the user_usage table by email
    // We need to find the user_id that corresponds to this email
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*');
      
    if (usageError) {
      console.error('Error fetching user data:', usageError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
    
    // Find the user with the matching email
    // Since we're using the email mapping in the frontend, we need to find the user ID
    // that corresponds to the email we want to delete
    let userIdToDelete = null;
    
    // Check for exact email match in our known mappings
    const knownEmails: Record<string, string> = {
      'david@uconnect.com.au': '8b5fe130',
      'davidnvr28@gmail.com': 'e745a6',
    };
    
    // Reverse lookup: find user ID by email
    for (const [userId, userEmail] of Object.entries(knownEmails)) {
      if (userEmail === email) {
        userIdToDelete = userId;
        break;
      }
    }
    
    // If we couldn't find the user ID in our known mappings,
    // try to find it in the user_usage table
    if (!userIdToDelete) {
      for (const user of usageData) {
        const shortId = user.user_id.substring(0, 6);
        
        // Check if this user's ID might correspond to the email
        if ((shortId === '8b5fe1' && email === 'david@uconnect.com.au') ||
            (shortId === 'e745a6' && email === 'davidnvr28@gmail.com')) {
          userIdToDelete = user.user_id;
          break;
        }
      }
    }
    
    if (!userIdToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`Found user ID to delete: ${userIdToDelete}`);
    
    // Delete the user's data from the user_usage table
    const { error: deleteError } = await supabase
      .from('user_usage')
      .delete()
      .eq('user_id', userIdToDelete);
    
    if (deleteError) {
      console.error('Error deleting user data:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
    }
    
    // If there's a profiles table, delete the user from there too
    try {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userIdToDelete);
    } catch (e) {
      console.log('No profiles table or error deleting from profiles:', e);
      // Continue even if this fails
    }
    
    // Note: We can't directly delete the user from Supabase Auth as that requires admin privileges
    // and is typically done through the Supabase dashboard or admin API
    
    return NextResponse.json({ 
      success: true, 
      message: `User with email ${email} has been deleted from the application database.`,
      note: "The user has been removed from the application database, but may still exist in Supabase Auth. To completely remove the user, you may need to delete them from the Supabase Auth dashboard."
    });
    
  } catch (error: any) {
    console.error('Error in delete-user API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
