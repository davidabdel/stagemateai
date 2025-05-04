import { createClient } from '@supabase/supabase-js';

// For security reasons, we'll use the same client as the regular supabase client
// In a production environment, you would use a proper service role key
// stored securely in environment variables
const supabaseUrl = 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';

// Create a Supabase client
// Note: Without a valid service role key, this will have the same permissions as the regular client
// For development purposes, we'll use this approach
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

// For a proper implementation, you would need to obtain a valid service role key
// from your Supabase dashboard and store it securely in environment variables
