// Simple script to test Supabase authentication
const { createClient } = require('@supabase/supabase-js');

// Use the same values we have in our environment
const supabaseUrl = 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZW9pcWZmaHFzem92c253bWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzgzNDAsImV4cCI6MjA2MTIxNDM0MH0.6sX-g6DDgaE_MkXwkoremlnB-oQ_7rwLN7XCmwQrao8';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test email and password
const testEmail = 'test' + Date.now() + '@example.com';
const testPassword = 'password123';

async function testSignUp() {
  console.log(`Testing signup with email: ${testEmail}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('Signup error:', error);
    } else {
      console.log('Signup successful:', data);
    }
  } catch (e) {
    console.error('Exception during signup:', e);
  }
}

// Run the test
testSignUp();
