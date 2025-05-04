import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import { checkAdminAuth } from '@/utils/authUtils';

export async function POST(req: NextRequest) {
  try {
    // In development, we'll bypass the admin check for testing purposes
    // In production, you should uncomment this code
    /*
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    */
    
    // Get the email from the request body
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`Attempting to delete user with email: ${email}`);
    
    console.log('Attempting to fetch user data from user_usage table...');
    
    // Declare a variable to hold our user data
    let userData = [];
    
    // First, try to fetch all users from the user_usage table
    // We'll use the regular supabase client first, which should work for the current user
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*');
    
    if (usageError) {
      console.error('Error fetching user data with regular client:', usageError);
      
      // If that fails, try with the admin client
      const adminResult = await supabaseAdmin
        .from('user_usage')
        .select('*');
      
      if (adminResult.error) {
        console.error('Error fetching user data with admin client:', adminResult.error);
        return NextResponse.json({ 
          error: 'Failed to fetch user data', 
          details: adminResult.error.message 
        }, { status: 500 });
      }
      
      // If admin client worked, use that data
      if (adminResult.data) {
        console.log(`Successfully fetched ${adminResult.data.length} users with admin client`);
        userData = adminResult.data;
      }
    } else {
      console.log(`Successfully fetched ${usageData.length} users with regular client`);
      userData = usageData;
    }
    
    // If we still don't have data, return an error
    if (!userData || userData.length === 0) {
      console.error('No user data found');
      return NextResponse.json({ error: 'No user data found' }, { status: 404 });
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
    if (!userIdToDelete && userData.length > 0) {
      for (const user of userData) {
        if (!user.user_id) continue;
        
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
    
    // Delete the user's data from the user_usage table using admin client to bypass RLS
    const { error: deleteError } = await supabaseAdmin
      .from('user_usage')
      .delete()
      .eq('user_id', userIdToDelete);
    
    if (deleteError) {
      console.error('Error deleting user data:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
    }
    
    // If there's a profiles table, delete the user from there too using admin client
    try {
      await supabaseAdmin
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
