import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Get all users directly from the user_usage table
    const { data: users, error: fetchError } = await supabase
      .from('user_usage')
      .select('*');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Return the raw data
    return NextResponse.json({ 
      success: true, 
      count: users?.length || 0,
      users: users 
    });
  } catch (error: any) {
    console.error('Error in debug-users route:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}
