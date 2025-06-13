import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { userId, credits, planType = 'standard' } = await req.json();
    
    if (!userId || !credits) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: userId and credits' 
      }, { status: 400 });
    }
    
    console.log(`Adding ${credits} credits to user ${userId} with plan type ${planType}`);
    
    // Check if user_usage record exists
    const { data: existingData, error: existingError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing user_usage:', existingError);
      return NextResponse.json({ 
        success: false, 
        error: `Error checking user_usage: ${existingError.message}` 
      }, { status: 500 });
    }
    
    let result;
    
    if (existingData) {
      // Update existing record
      console.log(`Updating existing user_usage record for ${userId}`);
      result = await supabase
        .from('user_usage')
        .update({
          photos_limit: credits,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new record
      console.log(`Creating new user_usage record for ${userId}`);
      result = await supabase
        .from('user_usage')
        .insert([{
          user_id: userId,
          photos_limit: credits,
          photos_used: 0,
          plan_type: planType,
          updated_at: new Date().toISOString()
        }]);
    }
    
    if (result.error) {
      console.error('Error updating/creating user_usage:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: `Error updating credits: ${result.error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${credits} credits to user ${userId}`,
      data: result.data
    });
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
