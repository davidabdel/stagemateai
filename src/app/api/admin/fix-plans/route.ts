import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // 1. Fix subscription plans - deactivate Free and Trial plans
    const { error: plansError } = await supabase
      .from('subscription_plans')
      .update({ is_active: false })
      .in('name', ['Free', 'Trial']);
    
    if (plansError) {
      console.error('Error deactivating Free/Trial plans:', plansError);
    }
    
    // 2. Fix plan names in user_usage - change 'free' and 'trial' to 'standard'
    const { error: usageError } = await supabase
      .from('user_usage')
      .update({ plan_type: 'standard' })
      .in('plan_type', ['free', 'trial']);
    
    if (usageError) {
      console.error('Error updating plan types in user_usage:', usageError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Plans fixed successfully',
      errors: {
        plansError: plansError?.message,
        usageError: usageError?.message
      }
    });
  } catch (error: any) {
    console.error('Error fixing plans:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
