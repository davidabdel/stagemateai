import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

// Helper function to check subscription status
async function checkSubscriptionStatus(userId: string) {
  if (!userId) {
    return { error: 'User ID is required', status: 400 };
  }

  // Check if the user has a canceled subscription that has expired
  const now = new Date().toISOString();

  // First check if we have a subscriptions table
  const { error: tableCheckError } = await supabase
    .from('subscriptions')
    .select('id')
    .limit(1);

  if (!tableCheckError) {
    // Check for expired subscriptions
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'canceled')
      .lt('current_period_end', now)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      // PGRST116 is "Results contain 0 rows" - not an error in this case
      console.error('Error checking subscription status:', subscriptionError);
      return { error: 'Failed to check subscription status', status: 500 };
    }

    // If we found an expired subscription, reset the user to free plan
    if (subscriptionData) {
      console.log(`Found expired subscription for user ${userId}, resetting to free plan`);
      
      // Update user to free plan with 3 credits
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          photos_limit: 3,
          plan_type: 'free',
          subscription_status: 'inactive',
          updated_at: now
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating user to free plan:', updateError);
        return { error: 'Failed to update user plan', status: 500 };
      }
      
      // Also update consolidated_users table
      const { error: consolidatedError } = await supabase
        .from('consolidated_users')
        .update({
          photos_limit: 3,
          plan_type: 'free',
          subscription_status: 'inactive',
          updated_at: now
        })
        .eq('user_id', userId);
      
      if (consolidatedError) {
        console.error('Error updating consolidated_users:', consolidatedError);
      }
      
      return { 
        data: { 
          status: 'updated', 
          message: 'User subscription has expired and been reset to free plan' 
        },
        status: 200
      };
    }
  } else {
    // If subscriptions table doesn't exist, check user_usage table
    const { data: userData, error: userError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError) {
      console.error('Error checking user status:', userError);
      return { error: 'Failed to check user status', status: 500 };
    }
    
    // Check if cancellation_date exists and is in the past
    if (userData.cancellation_date) {
      const cancellationDate = new Date(userData.cancellation_date);
      const currentDate = new Date();
      
      if (cancellationDate < currentDate && userData.plan_type !== 'free' && userData.plan_type !== 'trial') {
        // Update user to show canceled status
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({
            subscription_status: 'canceled'
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        }
      }
    }
    
    // No action needed, just return the current status
    return { 
      data: { 
        status: 'checked',
        subscription_status: userData.subscription_status || 'active',
        plan_type: userData.plan_type,
        photos_limit: userData.photos_limit,
        photos_used: userData.photos_used,
        cancellation_date: userData.cancellation_date
      },
      status: 200
    };
  }
  
  // No expired subscription found
  return { 
    data: { status: 'valid', message: 'No expired subscription found' },
    status: 200
  };
}

// Support both GET and POST methods
export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameter
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const result = await checkSubscriptionStatus(userId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in GET check-subscription-status:', error);
    return NextResponse.json({ error: 'Failed to check subscription status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the user ID from the request body
    const { userId } = await req.json();
    
    const result = await checkSubscriptionStatus(userId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in POST check-subscription-status:', error);
    return NextResponse.json({ error: 'Failed to check subscription status' }, { status: 500 });
  }
}
