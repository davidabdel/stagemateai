import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId, planType, photosLimit, photosUsed } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }
    
    console.log('Updating user data:', { userId, planType, photosLimit, photosUsed });
    
    // Update user_usage table
    const { data: userUsageData, error: userUsageError } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        plan_type: planType,
        photos_limit: photosLimit,
        photos_used: photosUsed || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (userUsageError) {
      console.error('Error updating user_usage:', userUsageError);
      return NextResponse.json({ error: userUsageError.message }, { status: 500 });
    }
    
    // Also update consolidated_users table to ensure consistency
    // First check if the user exists in consolidated_users
    const { data: consolidatedUser, error: findError } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log('Consolidated user check:', { consolidatedUser, findError });
    
    // If user exists, update; otherwise insert
    let consolidatedUpdateResult;
    
    if (consolidatedUser) {
      console.log('Updating existing consolidated user record');
      consolidatedUpdateResult = await supabase
        .from('consolidated_users')
        .update({
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Try to find user in auth to get email
      console.log('No consolidated user found, creating new record');
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser?.user?.email || 'user@example.com';
      
      consolidatedUpdateResult = await supabase
        .from('consolidated_users')
        .insert({
          user_id: userId,
          email: email,
          plan_type: planType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    console.log('Consolidated users update result:', consolidatedUpdateResult);
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated user ${userId} to plan ${planType} with ${photosLimit} credits` 
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
