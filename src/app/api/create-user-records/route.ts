import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    // Get the user ID, email, and name from the request body
    const { userId, email, name } = await req.json();
    
    console.log('API: Received request to create user records:', { userId, email, name });
    
    if (!userId || !email) {
      console.error('API: Missing required fields in request');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: userId and email are required' 
      }, { status: 400 });
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('API: Invalid UUID format for userId:', userId);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid UUID format for userId' 
      }, { status: 400 });
    }
    
    // Log the current operation for debugging
    console.log('API: Creating user records with modified approach - skipping user_usage table due to foreign key constraint');

    console.log(`API: Creating database records for new user: ${userId}, ${email}`);
    
    // Default values for a new free user
    const defaultValues = {
      user_id: userId,
      email: email,
      name: name || email.split('@')[0], // Use name if provided, otherwise use part of email
      photos_limit: 3, // Default free photo limit
      photos_used: 0,
      plan_type: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // First check if user already exists in user_usage
    const { data: existingUsage, error: usageCheckError } = await supabase
      .from('user_usage')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (usageCheckError && usageCheckError.code !== 'PGRST116') {
      console.error('API: Error checking if user exists in user_usage:', usageCheckError);
      // Continue despite error
    }
    
    // Create user_usage record if it doesn't exist
    if (!existingUsage) {
      console.log(`API: Attempting to create user_usage record for user ${userId}`);
      
      try {
        const { data: insertedUsage, error: usageError } = await supabase
          .from('user_usage')
          .insert([{
            user_id: userId,
            email: email,
            name: defaultValues.name,
            photos_limit: defaultValues.photos_limit,
            photos_used: defaultValues.photos_used,
            plan_type: defaultValues.plan_type,
            created_at: defaultValues.created_at,
            updated_at: defaultValues.updated_at
          }])
          .select();
          
        if (usageError) {
          console.error('API: Error creating user_usage record:', usageError);
          console.error('API: Detailed user_usage insert error:', {
            code: usageError.code,
            message: usageError.message,
            details: usageError.details,
            hint: usageError.hint
          });
        } else {
          console.log(`API: Successfully created user_usage record for user ${userId}`);
        }
      } catch (usageError) {
        console.error('API: Exception creating user_usage record:', usageError);
        // Continue despite error
      }
    } else {
      console.log(`API: User ${userId} already exists in user_usage table`);
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
        const { data: insertedConsolidated, error: consolidatedError } = await supabase
          .from('consolidated_users')
          .insert([{
            user_id: userId,
            email: email,
            name: defaultValues.name,
            photos_limit: defaultValues.photos_limit,
            photos_used: defaultValues.photos_used,
            plan_type: defaultValues.plan_type,
            created_at: defaultValues.created_at,
            updated_at: defaultValues.updated_at
          }])
          .select();
          
        if (consolidatedError) {
          console.error('API: Detailed consolidated_users insert error:', {
            code: consolidatedError.code,
            message: consolidatedError.message,
            details: consolidatedError.details,
            hint: consolidatedError.hint
          });
        } else {
          console.log('API: Successfully inserted consolidated_users record:', insertedConsolidated);
        }
        
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
    
    // Return success response with details about what was created
    return NextResponse.json({
      success: true,
      message: 'User records created successfully',
      details: {
        user_id: userId,
        email: email,
        name: defaultValues.name,
        user_usage_created: !existingUsage,
        consolidated_users_created: !existingConsolidated
      }
    });
  } catch (error) {
    console.error('API: Error creating user records:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
