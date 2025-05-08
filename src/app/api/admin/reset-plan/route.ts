import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Directly resetting plan for user:', userId);
    
    // Directly update the user's plan in the database
    const { data, error } = await supabase
      .from('user_usage')
      .update({
        plan_type: 'free',
        subscription_status: 'canceled',
        photos_limit: 3,
        updated_at: new Date().toISOString(),
        cancellation_date: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Error updating user plan:', error);
      return NextResponse.json({ error: 'Failed to update user plan' }, { status: 500 });
    }
    
    console.log('Successfully reset plan for user:', userId);
    console.log('Updated data:', data);
    
    return NextResponse.json({
      success: true,
      message: 'User plan has been reset to free',
      data
    });
  } catch (error: any) {
    console.error('Error in reset-plan API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset user plan' },
      { status: 500 }
    );
  }
}
