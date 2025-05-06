import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    console.log('API: Fetching all users from consolidated_users table...');
    
    // First, try to get a count directly using the count function
    const { count, error: countError } = await supabase
      .from('consolidated_users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('API: Error getting count:', countError);
      
      // If count fails, try to get all users and count them manually
      const { data, error } = await supabase
        .from('consolidated_users')
        .select('*');
      
      if (error) {
        console.error('API: Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
      
      console.log(`API: Successfully fetched ${data?.length || 0} users manually`);
      
      return NextResponse.json({ 
        success: true, 
        count: data?.length || 0,
        users: data 
      });
    }
    
    console.log(`API: Successfully got count: ${count}`);
    
    // If we just need the count, we can return it directly
    // For a full admin panel, we would also fetch the actual user data
    const { data, error } = await supabase
      .from('consolidated_users')
      .select('*');
    
    if (error) {
      console.error('API: Error fetching users after count:', error);
      return NextResponse.json({ 
        success: true, 
        count: count,
        users: [] 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      count: count,
      users: data 
    });
  } catch (error: any) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}
