import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // For simplicity, we're not doing authentication checks in this endpoint
    // In a production environment, you would implement proper authentication
    
    console.log('Fetching all users from consolidated_users table...');
    
    // Fetch all users from consolidated_users table
    const { data, error } = await supabase
      .from('consolidated_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    
    console.log(`Successfully fetched ${data?.length || 0} users`);
    
    return NextResponse.json({ users: data });
  } catch (err) {
    console.error('Unexpected error in get-all-users API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
