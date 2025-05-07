import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpeoiqffhqszovsnwmjt.supabase.co';

// For admin operations, we should use the service role key if available
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';

// Create a Supabase client with admin privileges if service key is available
// Otherwise, fall back to anon key (which will have limited permissions)
const key = supabaseServiceKey || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, key);

// Note: For proper admin operations, you should ensure the SUPABASE_SERVICE_ROLE_KEY
// is set in your environment variables
