import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching user credits from user_usage table');
    
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
    
    console.log(`Successfully fetched ${userCredits?.length || 0} user credit records`);
    
    // If no records were found, return an empty array instead of null
    const credits = userCredits || [];
    
    return NextResponse.json({ 
      success: true, 
      userCredits: credits
    });
  } catch (error: any) {
    console.error('Error in user-credits API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
