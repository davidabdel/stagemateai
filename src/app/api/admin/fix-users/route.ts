import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Get all users from the user_usage table
    const { data: users, error: fetchError } = await supabase
      .from('user_usage')
      .select('*');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log('Found users:', users);

    // Map of known user IDs to emails - hardcoded for immediate fix
    const emailMap: Record<string, string> = {
      '8b5fe130-d3f3-4b06-eff4-7d6639b1bc': 'david@uconnect.com.au',
      'f5c8cefe-767-4d7a-9d0c-f9e57c8c7f9': 'test@stagemateai.com',
      '0c3b5e47-b9f8-4f71-8932-e931c5d5df8a': 'user@stagemateai.com',
      'e745a6ce-57d3-41f2-e611-23edc9bd16f7': 'davidnvr28@gmail.com',
    };

    // Results tracking
    const results = {
      total: users?.length || 0,
      updated: 0,
      errors: 0,
      details: [] as string[]
    };

    // Update each user with their email
    if (users) {
      for (const user of users) {
        // Get the user ID
        const userId = user.user_id;
        
        // Get the email from our map or create a placeholder
        let email = emailMap[userId];
        
        // If we don't have a mapping, create a placeholder email
        if (!email) {
          const shortId = userId.substring(0, 6);
          email = `${shortId}@stagemateai.com`;
        }
        
        try {
          // Update the user record with the email
          const { error: updateError } = await supabase
            .from('user_usage')
            .update({ email: email })
            .eq('id', user.id);

          if (updateError) {
            console.error(`Error updating email for user ${user.id}:`, updateError);
            results.errors++;
            results.details.push(`Failed to update user ${user.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.details.push(`Updated user ${user.id} with email ${email}`);
          }
        } catch (error: any) {
          console.error(`Error updating user ${user.id}:`, error);
          results.errors++;
          results.details.push(`Exception for user ${user.id}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${results.updated} of ${results.total} users`,
      results 
    });
  } catch (error: any) {
    console.error('Error in fix-users route:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}
