import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Get all user credits from the user_usage table
    const { data: userCredits, error } = await supabase
      .from('user_usage')
      .select('*');
    
    if (error) {
      console.error('Error fetching user credits:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      userCredits
    });
  } catch (error: any) {
    console.error('Error in user-credits API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
