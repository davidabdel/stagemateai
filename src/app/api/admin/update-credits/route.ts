import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, credits, planType } = body;
    
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    
    if (isNaN(credits) || credits <= 0) {
      return NextResponse.json({ success: false, message: 'Credits must be a positive number' }, { status: 400 });
    }
    
    // Find user by email
    const { data: users, error: userError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('email', email)
      .limit(1);
    
    if (userError) {
      console.error('Error finding user:', userError);
      return NextResponse.json({ success: false, message: 'Error finding user' }, { status: 500 });
    }
    
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const user = users[0];
    const currentCredits = user.photos_limit || 0;
    const newCredits = currentCredits + credits;
    
    // Store the before state
    const beforeState = {
      credits: currentCredits,
      plan: user.plan_type || 'standard'
    };
    
    // Update user credits
    const { data: updateData, error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        photos_limit: newCredits,
        plan_type: planType || user.plan_type || 'standard',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();
    
    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return NextResponse.json({ success: false, message: 'Error updating user credits' }, { status: 500 });
    }
    
    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('email', email)
      .limit(1);
    
    if (verifyError || !verifyData || verifyData.length === 0) {
      console.error('Error verifying update:', verifyError);
      return NextResponse.json({ success: false, message: 'Error verifying update' }, { status: 500 });
    }
    
    const updatedUser = verifyData[0];
    
    // Store the after state
    const afterState = {
      credits: updatedUser.photos_limit,
      plan: updatedUser.plan_type
    };
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${credits} credits to user ${email}`,
      before: beforeState,
      after: afterState
    });
    
  } catch (error) {
    console.error('Error in update-credits API:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}