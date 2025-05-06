import { NextRequest, NextResponse } from 'next/server';
import { syncAllUserCredits, syncUserCredits } from '@/utils/creditSyncService';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the user ID from the query params if provided
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    let result;
    if (userId) {
      // Sync credits for a specific user
      result = await syncUserCredits(userId);
    } else {
      // Sync credits for all users
      result = await syncAllUserCredits();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in sync-credits API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint for webhook integration
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if needed
    const webhookSecret = process.env.CREDIT_SYNC_WEBHOOK_SECRET;
    const authHeader = request.headers.get('x-webhook-secret');
    
    if (webhookSecret && authHeader !== webhookSecret) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
    }

    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      // If no user ID provided, sync all users
      const result = await syncAllUserCredits();
      return NextResponse.json(result);
    }

    // Sync credits for the specified user
    const result = await syncUserCredits(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in sync-credits webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
