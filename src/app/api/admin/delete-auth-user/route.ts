import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

// Create a Supabase client with the service role key for admin operations
// This client has elevated privileges and should only be used in secure server contexts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    console.log('DELETE AUTH USER API: Starting user deletion process');
    
    // Get the user ID from the request body
    const { userId, email } = await req.json();
    console.log('DELETE AUTH USER API: Request payload:', { userId, email });
    
    if (!userId && !email) {
      console.log('DELETE AUTH USER API: Missing required fields');
      return NextResponse.json({ error: 'Either User ID or email is required' }, { status: 400 });
    }
    
    let userIdToDelete = userId;
    
    // If only email is provided, try to find the user ID
    if (!userIdToDelete && email) {
      console.log(`Looking up user ID for email: ${email}`);
      
      // Fetch all users from the user_usage table
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*');
      
      if (usageError) {
        console.error('Error fetching user data:', usageError);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
      }
      
      // Known email mappings
      const knownEmails = {
        'david@uconnect.com.au': '8b5fe130',
        'davidnvr28@gmail.com': 'e745a6',
      };
      
      // Check if the email is in our known mappings
      for (const [knownId, knownEmail] of Object.entries(knownEmails)) {
        if (knownEmail === email) {
          userIdToDelete = knownId;
          break;
        }
      }
      
      // If not found in known mappings, check the user_usage table
      if (!userIdToDelete && usageData) {
        for (const user of usageData) {
          if (!user.user_id) continue;
          
          const shortId = user.user_id.substring(0, 6);
          
          if ((shortId === '8b5fe1' && email === 'david@uconnect.com.au') ||
              (shortId === 'e745a6' && email === 'davidnvr28@gmail.com') ||
              (user.email === email)) {
            userIdToDelete = user.user_id;
            break;
          }
        }
      }
      
      if (!userIdToDelete) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }
    
    console.log(`Attempting to delete user with ID: ${userIdToDelete}`);
    
    // First, delete the user from database tables
    let dbDeletionResults = {
      user_usage: false,
      profiles: false
    };
    
    // Delete from user_usage table
    try {
      const { error: deleteUsageError } = await supabase
        .from('user_usage')
        .delete()
        .eq('user_id', userIdToDelete);
      
      if (!deleteUsageError) {
        dbDeletionResults.user_usage = true;
      } else {
        console.error('Error deleting from user_usage:', deleteUsageError);
      }
    } catch (e) {
      console.error('Exception deleting from user_usage:', e);
    }
    
    // Try to delete from profiles table if it exists
    try {
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userIdToDelete);
      
      if (!deleteProfileError) {
        dbDeletionResults.profiles = true;
      }
    } catch (e) {
      console.log('No profiles table or error deleting from profiles:', e);
    }
    
    // Check if we have a service role key before attempting to delete from Auth
    console.log('DELETE AUTH USER API: Checking for service role key');
    console.log('DELETE AUTH USER API: Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('DELETE AUTH USER API: Service role key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('DELETE AUTH USER API: Service role key is missing');
      return NextResponse.json({ 
        success: false, 
        error: 'SUPABASE_SERVICE_ROLE_KEY is not set. Cannot delete user from Auth.',
        dbDeletionResults,
        note: 'The user may have been deleted from database tables, but not from Supabase Auth due to missing service role key.'
      }, { status: 500 });
    }
    
    // Delete the user from Supabase Auth
    console.log(`DELETE AUTH USER API: Attempting to delete user with ID: ${userIdToDelete} from Supabase Auth`);
    console.log('DELETE AUTH USER API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
      
      if (error) {
        console.error('DELETE AUTH USER API: Error deleting user from Auth:', error);
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          dbDeletionResults,
          note: 'The user may have been deleted from database tables, but not from Supabase Auth.'
        }, { status: 500 });
      }
      
      console.log('DELETE AUTH USER API: Successfully deleted user from Supabase Auth');
    } catch (authError: any) {
      console.error('DELETE AUTH USER API: Exception during Auth deletion:', authError);
      return NextResponse.json({ 
        success: false, 
        error: authError.message || 'Exception during Auth deletion',
        dbDeletionResults,
        note: 'The user may have been deleted from database tables, but an exception occurred when deleting from Supabase Auth.'
      }, { status: 500 });
    }
    
    console.log('DELETE AUTH USER API: Deletion process completed successfully');
    console.log('DELETE AUTH USER API: Database deletion results:', dbDeletionResults);
    
    return NextResponse.json({ 
      success: true, 
      message: `User with ID ${userIdToDelete} has been completely deleted.`,
      dbDeletionResults
    });
    
  } catch (error: any) {
    console.error('DELETE AUTH USER API: Unhandled error in API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
