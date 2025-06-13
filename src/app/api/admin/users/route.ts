import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Get users directly from the user_usage table since we're using Clerk for auth
    // and don't have direct access to the auth.users table
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
    const users = usageData.map(usage => ({
      id: usage.user_id,
      email: `user_${usage.user_id.substring(0, 8)}@example.com`, // Placeholder email since we don't have actual emails
      created_at: usage.created_at || new Date().toISOString(),
      photos_used: usage.photos_used,
      photos_limit: usage.photos_limit,
      plan_type: usage.plan_type
    }));
    
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
