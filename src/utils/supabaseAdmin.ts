import { createClient } from '@supabase/supabase-js';

// Use environment variables for the service role key in production
// For development, we'll use a direct key, but this should be secured in production
const supabaseUrl = 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTYzODM0MCwiZXhwIjoyMDYxMjE0MzQwfQ.zcHZm-Ks_ydvCBdyXfIRvmCNPXhDdKcmVrGLDtC2Yk0';

// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
