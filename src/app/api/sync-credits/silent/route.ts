import { NextRequest, NextResponse } from 'next/server';
import { syncUserCredits } from '@/utils/creditSyncService';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify the user exists before syncing
    const { data: userData, error: userError } = await supabase
      .from('consolidated_users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error verifying user existence:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sync credits for the specific user
    const result = await syncUserCredits(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in silent sync-credits API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
