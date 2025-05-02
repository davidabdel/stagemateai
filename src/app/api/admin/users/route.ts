import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Get all users from the auth.users table or your custom users table
    // This might need to be adjusted based on your actual user table structure
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('*');
    
    if (error) {
      // If the auth.users table doesn't exist or can't be accessed,
      // try to get users from user_usage table instead
      console.log('Error fetching from auth.users, trying user_usage table:', error);
      
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*');
      
      if (usageError) {
        console.error('Error fetching from user_usage:', usageError);
        return NextResponse.json({ 
          success: false, 
          error: usageError.message 
        }, { status: 500 });
      }
      
      // Convert user_usage data to user format
      const usersFromUsage = usageData.map(usage => ({
        id: usage.user_id,
        email: `user_${usage.user_id.substring(0, 8)}@example.com`, // Placeholder email
        created_at: usage.created_at || new Date().toISOString()
      }));
      
      return NextResponse.json({ 
        success: true, 
        users: usersFromUsage
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      users
    });
  } catch (error: any) {
    console.error('Error in users API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
