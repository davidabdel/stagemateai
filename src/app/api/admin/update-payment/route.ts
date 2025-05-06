import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const { userId, planType, creditsToAdd } = await request.json();

    if (!userId || !planType || !creditsToAdd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Using the imported Supabase client directly

    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: `Error fetching user data: ${userError.message}` },
        { status: 500 }
      );
    }

    // Calculate new credits
    const currentCredits = userData?.photos_limit || 0;
    const newCredits = currentCredits + creditsToAdd;

    // Update user_usage table
    const { error: updateError } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        photos_limit: newCredits,
        photos_used: userData?.photos_used || 0,
        plan_type: planType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Error updating user account:', updateError);
      return NextResponse.json(
        { error: `Error updating user account: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Also update consolidated_users table
    const { data: consolidatedUser } = await supabase
      .from('consolidated_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (consolidatedUser) {
      // Update existing record
      const { error: updateConsolidatedError } = await supabase
        .from('consolidated_users')
        .update({
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateConsolidatedError) {
        console.error('Error updating consolidated user:', updateConsolidatedError);
        // Don't fail the whole operation if this fails
      }
    } else {
      // Try to get user email
      const { data: userDetails } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      // Create new record
      const { error: insertError } = await supabase
        .from('consolidated_users')
        .insert({
          user_id: userId,
          email: userDetails?.email || 'user@example.com',
          plan_type: planType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating consolidated user:', insertError);
        // Don't fail the whole operation if this fails
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      planType,
      previousCredits: currentCredits,
      newCredits
    });
  } catch (error: any) {
    console.error('Unexpected error in update-payment:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
