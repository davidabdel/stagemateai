import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    // Get the user ID and email from the request body
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and email are required' 
      }, { status: 400 });
    }

    console.log(`API: Creating database records for new user: ${userId}, ${email}`);
    
    // Default values for a new free user
    const defaultValues = {
      user_id: userId,
      email: email,
      photos_limit: 3, // Default free photo limit
      photos_used: 0,
      plan_type: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // First, check if the user already exists in user_usage to avoid duplicates
    const { data: existingUserUsage, error: checkError } = await supabase
      .from('user_usage')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('API: Error checking if user exists in user_usage:', checkError);
      // Continue despite error
    }
    
    let userUsageCreated = false;
    
    // Create user_usage record if it doesn't exist
    if (!existingUserUsage) {
      console.log(`API: Creating user_usage record for user ${userId}`);
      
      try {
        const { error: usageError } = await supabase
          .from('user_usage')
          .insert([{
            user_id: userId,
            photos_limit: defaultValues.photos_limit,
            photos_used: defaultValues.photos_used,
            plan_type: defaultValues.plan_type,
            created_at: defaultValues.created_at,
            updated_at: defaultValues.updated_at
          }]);
        
        if (usageError) {
          console.error('API: Error creating user_usage record:', usageError);
          // Continue despite error
        } else {
          userUsageCreated = true;
          console.log(`API: Successfully created user_usage record for user ${userId}`);
        }
      } catch (usageError) {
        console.error('API: Exception creating user_usage record:', usageError);
        // Continue despite error
      }
    } else {
      userUsageCreated = true;
      console.log(`API: User ${userId} already exists in user_usage`);
    }
    
    // Now check if user exists in consolidated_users
    const { data: existingConsolidated, error: consolidatedCheckError } = await supabase
      .from('consolidated_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (consolidatedCheckError && consolidatedCheckError.code !== 'PGRST116') {
      console.error('API: Error checking if user exists in consolidated_users:', consolidatedCheckError);
      // Continue despite error
    }
    
    let consolidatedUserCreated = false;
    
    // Create consolidated_users record if it doesn't exist
    if (!existingConsolidated) {
      console.log(`API: Creating consolidated_users record for user ${userId}`);
      
      try {
        const { error: consolidatedError } = await supabase
          .from('consolidated_users')
          .insert([{
            user_id: userId,
            email: email,
            photos_limit: defaultValues.photos_limit,
            photos_used: defaultValues.photos_used,
            plan_type: defaultValues.plan_type,
            created_at: defaultValues.created_at,
            updated_at: defaultValues.updated_at
          }]);
        
        if (consolidatedError) {
          console.error('API: Error creating consolidated_users record:', consolidatedError);
          // Continue despite error
        } else {
          consolidatedUserCreated = true;
          console.log(`API: Successfully created consolidated_users record for user ${userId}`);
        }
      } catch (consolidatedError) {
        console.error('API: Exception creating consolidated_users record:', consolidatedError);
        // Continue despite error
      }
    } else {
      consolidatedUserCreated = true;
      console.log(`API: User ${userId} already exists in consolidated_users`);
    }
    
    // Return success status
    return NextResponse.json({ 
      success: userUsageCreated || consolidatedUserCreated, 
      userUsageCreated,
      consolidatedUserCreated,
      message: 'User records processed'
    });
  } catch (error) {
    console.error('API: Error creating user records:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
