import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get all users from both tables
    const { data: consolidatedUsers, error: consolidatedError } = await supabase
      .from('consolidated_users')
      .select('id, photos_limit, photos_used');
    
    if (consolidatedError) {
      console.error('Error fetching consolidated users:', consolidatedError);
      return NextResponse.json({ error: 'Failed to fetch consolidated users' }, { status: 500 });
    }
    
    const { data: userUsage, error: usageError } = await supabase
      .from('user_usage')
      .select('user_id, photos_limit, photos_used');
    
    if (usageError) {
      console.error('Error fetching user usage:', usageError);
      return NextResponse.json({ error: 'Failed to fetch user usage' }, { status: 500 });
    }
    
    // Create a map of user_usage records for quick lookup
    const usageMap = new Map();
    userUsage?.forEach(usage => {
      usageMap.set(usage.user_id, usage);
    });
    
    // Process each consolidated user
    const results = [];
    
    for (const user of consolidatedUsers || []) {
      const usage = usageMap.get(user.id);
      
      // If user doesn't have a user_usage record, create one
      if (!usage) {
        const { error: insertError } = await supabase
          .from('user_usage')
          .insert([{
            user_id: user.id,
            photos_limit: user.photos_limit,
            photos_used: user.photos_used || 0,
            plan_type: 'standard', // Default
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.error(`Error creating user_usage for ${user.id}:`, insertError);
          results.push({ userId: user.id, action: 'create', success: false });
        } else {
          results.push({ userId: user.id, action: 'create', success: true });
        }
        continue;
      }
      
      // If limits don't match, update user_usage to match consolidated_users
      if (usage.photos_limit !== user.photos_limit) {
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({ 
            photos_limit: user.photos_limit,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error(`Error updating photos_limit for ${user.id}:`, updateError);
          results.push({ userId: user.id, action: 'update_limit', success: false });
        } else {
          results.push({ userId: user.id, action: 'update_limit', success: true });
        }
      }
      
      // If used counts don't match, update user_usage to match consolidated_users
      if (usage.photos_used !== (user.photos_used || 0)) {
        const { error: updateError } = await supabase
          .from('user_usage')
          .update({ 
            photos_used: user.photos_used || 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error(`Error updating photos_used for ${user.id}:`, updateError);
          results.push({ userId: user.id, action: 'update_used', success: false });
        } else {
          results.push({ userId: user.id, action: 'update_used', success: true });
        }
      }
    }
    
    return NextResponse.json({ 
      message: 'Credit synchronization complete',
      results,
      totalProcessed: consolidatedUsers?.length || 0
    });
    
  } catch (error) {
    console.error('Error in fix-credits API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
