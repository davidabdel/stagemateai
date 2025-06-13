import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    // Get the email from the request body
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`Attempting to delete user with email: ${email}`);
    
    // Fetch all users from the user_usage table
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*');
    
    if (usageError) {
      console.error('Error fetching user data:', usageError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
    
    if (!usageData || usageData.length === 0) {
      return NextResponse.json({ error: 'No user data found' }, { status: 404 });
    }
    
    // Find the user with the matching email
    let userIdToDelete = null;
    
    // Known email mappings
    const knownEmails = {
      'david@uconnect.com.au': '8b5fe130',
      'davidnvr28@gmail.com': 'e745a6',
    };
    
    // Check if the email is in our known mappings
    for (const [userId, userEmail] of Object.entries(knownEmails)) {
      if (userEmail === email) {
        userIdToDelete = userId;
        break;
      }
    }
    
    // If not found in known mappings, check the user_usage table
    if (!userIdToDelete) {
      for (const user of usageData) {
        if (!user.user_id) continue;
        
        const shortId = user.user_id.substring(0, 6);
        
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
    
    // Delete the user from the user_usage table
    const { error: deleteError } = await supabase
      .from('user_usage')
      .delete()
      .eq('user_id', userIdToDelete);
    
    if (deleteError) {
      console.error('Error deleting user data:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete user data', 
        details: deleteError.message,
        note: 'This may be due to RLS policies. Please run the SQL commands to remove RLS policies.'
      }, { status: 500 });
    }
    
    // Try to delete from profiles table if it exists
    try {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userIdToDelete);
    } catch (e) {
      console.log('No profiles table or error deleting from profiles:', e);
      // Continue even if this fails
    }
    
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
