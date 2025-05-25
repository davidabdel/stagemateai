import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are properly accessed
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not found, using fallback URL');
    return 'https://bpeoiqffhqszovsnwmjt.supabase.co';
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not found, using fallback key');
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';
  }
  return key;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Create the Supabase client with error handling
let supabaseClient;
try {
  console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 20) + '...');
  // Create the client with options to handle errors better
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Provide a fallback client that won't crash the app
  supabaseClient = createClient(
    'https://bpeoiqffhqszovsnwmjt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8'
  );
}

// Export the client
export const supabase = supabaseClient;