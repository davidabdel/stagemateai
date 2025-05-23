import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.credits || isNaN(body.credits) || body.credits <= 0) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }
    
    // Get the user's email and credits to add
    const { email, credits, planType } = body;
    
    // First, get the current user data
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { success: false, message: `Error fetching user data: ${userError.message}` },
        { status: 500 }
      );
    }
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate new limit
    const currentLimit = userData.photos_limit || 0;
    const newLimit = currentLimit + parseInt(credits);
    
    // Update the user's credits
    const { data: updateData, error: updateError } = await supabase
      .from('user_usage')
      .update({
        photos_limit: newLimit,
        plan_type: planType || userData.plan_type,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);
    
    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return NextResponse.json(
        { success: false, message: `Error updating user credits: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('email', email)
      .single();
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return NextResponse.json(
        { success: false, message: `Update may have failed: ${verifyError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Added ${credits} credits to user`,
      before: {
        credits: currentLimit,
        plan: userData.plan_type
      },
      after: {
        credits: verifyData.photos_limit,
        plan: verifyData.plan_type
      }
    });
  } catch (error) {
    console.error('Error in update-credits API:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing request' },
      { status: 500 }
    );
  }
}
