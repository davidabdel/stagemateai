import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'check_tables';
    
    // Get database information to help debug the issue
    const dbInfo: any = {
      timestamp: new Date().toISOString(),
      action: action
    };
    
    // Check which tables exist in the database
    if (action === 'check_tables' || action === 'all') {
      const tables = ['user_usage', 'consolidated_users', 'users', 'stripe_customers', 'subscriptions'];
      dbInfo.tables = {};
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          dbInfo.tables[table] = {
            exists: !error,
            count: count || 0,
            error: error ? `${error.code}: ${error.message}` : null
          };
        } catch (err: any) {
          dbInfo.tables[table] = {
            exists: false,
            count: 0,
            error: err.message || String(err)
          };
        }
      }
    }
    
    // Get table schemas
    if (action === 'schemas' || action === 'all') {
      dbInfo.schemas = {};
      
      try {
        // This is a simplified approach - in a real scenario you'd use introspection
        // or a dedicated API to get schema information
        const { data: userUsageData, error: userUsageError } = await supabase
          .from('user_usage')
          .select('*')
          .limit(1);
        
        if (!userUsageError && userUsageData && userUsageData.length > 0) {
          dbInfo.schemas.user_usage = Object.keys(userUsageData[0]);
        } else {
          dbInfo.schemas.user_usage = { error: userUsageError ? `${userUsageError.code}: ${userUsageError.message}` : 'No data' };
        }
        
        const { data: consolidatedUsersData, error: consolidatedUsersError } = await supabase
          .from('consolidated_users')
          .select('*')
          .limit(1);
        
        if (!consolidatedUsersError && consolidatedUsersData && consolidatedUsersData.length > 0) {
          dbInfo.schemas.consolidated_users = Object.keys(consolidatedUsersData[0]);
        } else {
          dbInfo.schemas.consolidated_users = { error: consolidatedUsersError ? `${consolidatedUsersError.code}: ${consolidatedUsersError.message}` : 'No data' };
        }
      } catch (err: any) {
        dbInfo.schemas.error = err.message || String(err);
      }
    }
    
    // Test creating a temporary user record
    if (action === 'test_insert' || action === 'all') {
      dbInfo.test_insert = {};
      
      const testUserId = `test-${Date.now()}`;
      const testEmail = `test-${Date.now()}@example.com`;
      
      try {
        // Try inserting into user_usage
        const { error: userUsageError } = await supabase
          .from('user_usage')
          .insert([{
            user_id: testUserId,
            photos_limit: 3,
            photos_used: 0,
            plan_type: 'free',
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        dbInfo.test_insert.user_usage = {
          success: !userUsageError,
          error: userUsageError ? `${userUsageError.code}: ${userUsageError.message}` : null
        };
        
        // Try inserting into consolidated_users
        const { error: consolidatedError } = await supabase
          .from('consolidated_users')
          .insert([{
            user_id: testUserId,
            email: testEmail,
            photos_limit: 3,
            photos_used: 0,
            plan_type: 'free',
            subscription_status: 'inactive',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        dbInfo.test_insert.consolidated_users = {
          success: !consolidatedError,
          error: consolidatedError ? `${consolidatedError.code}: ${consolidatedError.message}` : null
        };
        
        // Clean up test data
        await supabase.from('user_usage').delete().eq('user_id', testUserId);
        await supabase.from('consolidated_users').delete().eq('user_id', testUserId);
      } catch (err: any) {
        dbInfo.test_insert.error = err.message || String(err);
      }
    }
    
    return NextResponse.json(dbInfo);
  } catch (error: any) {
    console.error('Error in debug-database API:', error);
    return NextResponse.json({ 
      error: error.message || String(error) 
    }, { status: 500 });
  }
}
