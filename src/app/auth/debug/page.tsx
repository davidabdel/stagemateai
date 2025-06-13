'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AuthDebugPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [supabaseConfig, setSupabaseConfig] = useState<Record<string, any> | null>(null);

  // Helper to add logs
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    console.log(message); // Also log to console for easier debugging
  };
  
  // Test Supabase connection and auth settings
  async function testSupabaseConnection() {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      addLog('Testing Supabase connection...');
      
      // Get Supabase health with a simpler query
      const { data, error } = await supabase.from('user_usage').select('*').limit(1);
      
      if (error) {
        addLog(`Supabase connection test failed: ${JSON.stringify(error)}`);
        throw error;
      }
      
      addLog(`Supabase connection successful. Data: ${JSON.stringify(data)}`);
      
      // Now test auth functionality directly
      addLog('Testing Supabase auth settings...');
      
      // Get auth settings
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        addLog(`Auth test failed: ${JSON.stringify(authError)}`);
      } else {
        addLog(`Auth session check successful: ${JSON.stringify(authData)}`);
      }
      
      // Check if email auth is enabled by trying to get auth settings
      const authSettings = {
        url: 'https://bpeoiqffhqszovsnwmjt.supabase.co',
        siteUrl: window.location.origin,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      setSupabaseConfig(authSettings);
      addLog(`Environment configuration: ${JSON.stringify(authSettings)}`);
      
      // Test a simple auth operation that doesn't require email
      try {
        addLog('Testing auth API directly...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'invalidpassword123'
        });
        
        // We expect this to fail with an invalid login error, not with an empty error
        if (signInError) {
          addLog(`Expected auth error (good): ${JSON.stringify(signInError)}`);
        } else {
          addLog(`Unexpected success: ${JSON.stringify(signInData)}`);
        }
      } catch (err) {
        addLog(`Unexpected error in auth test: ${JSON.stringify(err)}`);
      }
      
      setSuccess('Supabase connection test successful!');
    } catch (err) {
      addLog(`Supabase connection test error: ${JSON.stringify(err)}`);
      if (err instanceof Error) {
        setError(`Connection test failed: ${err.message}`);
      } else {
        setError('Connection test failed with an unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function handleSignUp() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      addLog(`Attempting to sign up with email: ${email}`);
      
      // Sign up with Supabase with more detailed response
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      // Log the full response for debugging
      addLog(`Supabase sign-up response received`);
      
      if (error) {
        addLog(`Error during sign-up: ${JSON.stringify(error)}`);
        addLog(`Error message: ${error.message || 'No message'}`);
        addLog(`Error code: ${error.code || 'No code'}`);
        addLog(`Error status: ${error.status || 'No status'}`);
        // Use a type-safe approach to log any additional properties
        const errorObj = error as Record<string, any>;
        if (errorObj.details) {
          addLog(`Error details: ${JSON.stringify(errorObj.details)}`);
        }
        throw error;
      }
      
      // Log user data for debugging
      if (data && data.user) {
        addLog(`User ID created: ${data.user.id}`);
        addLog(`Email confirmation needed: ${!data.session}`);
        
        if (data.user.identities && data.user.identities.length === 0) {
          addLog(`User identities array is empty - user might already exist`);
          setError("An account with this email already exists. Please sign in instead.");
          return;
        }
        
        if (data.session) {
          addLog(`User was signed in automatically - email confirmation might be disabled`);
          setSuccess("Account created and signed in successfully!");
        } else {
          addLog(`Email confirmation required - check email inbox`);
          setSuccess("Account created! Please check your email for the confirmation link.");
        }
      } else {
        addLog(`User was not created properly: ${JSON.stringify(data)}`);
        setError("Account creation was not completed. Please try again or contact support.");
      }
    } catch (err: unknown) {
      addLog(`Raw error object: ${JSON.stringify(err)}`);
      
      if (err instanceof Error) {
        addLog(`Error caught: ${err.message}`);
        addLog(`Error name: ${err.name}`);
        addLog(`Error stack: ${err.stack}`);
        
        // Try to extract more information from the error object
        const errorObj = err as Record<string, any>;
        Object.keys(errorObj).forEach(key => {
          try {
            addLog(`Error property ${key}: ${JSON.stringify(errorObj[key])}`);
          } catch (e) {
            addLog(`Could not stringify error property ${key}`);
          }
        });
        
        setError(err.message || 'An unknown error occurred');
      } else {
        addLog(`Unknown error type: ${typeof err}`);
        addLog(`Unknown error: ${String(err)}`);
        setError("Failed to sign up. Please try again or contact support.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#0f172a] dark:text-white mb-2">
          Auth Debug Tool
        </h1>
        <p className="text-center text-[#64748b] dark:text-[#cbd5e1] mb-6">
          Test Supabase authentication and diagnose issues
        </p>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-[#e5e7eb] dark:border-[#334155] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-[#f8fafc] dark:bg-[#23272f] text-[#1e293b] dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-[#e5e7eb] dark:border-[#334155] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-[#f8fafc] dark:bg-[#23272f] text-[#1e293b] dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 font-medium">{success}</p>
            </div>
          )}
          
          <button
            onClick={testSupabaseConnection}
            className="w-full rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition-colors flex justify-center items-center mb-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : (
              "Test Supabase Connection"
            )}
          </button>
          
          <button
            onClick={handleSignUp}
            className="w-full rounded-md bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold py-3 transition-colors flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Test Sign Up"
            )}
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#e5e7eb] dark:border-[#334155]">
          <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white mb-2">Debug Logs</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md max-h-60 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono mb-1 text-gray-700 dark:text-gray-300">
                  {log}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No logs yet. Try signing up to see detailed logs.</p>
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#e5e7eb] dark:border-[#334155]">
          <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white mb-2">Quick Test Sign-up</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            This will generate a random test email and attempt to sign up, bypassing the form fields above.
          </p>
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                setError('');
                setSuccess('');
                
                // Generate a random test email
                const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
                const testPassword = 'Test123456!';
                
                addLog(`Testing signup with random email: ${randomEmail}`);
                
                // Try the signup directly with the Supabase client
                const { data, error } = await supabase.auth.signUp({
                  email: randomEmail,
                  password: testPassword,
                  options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                  }
                });
                
                addLog(`Raw signup response: ${JSON.stringify({ data, error })}`);
                
                if (error) {
                  if (Object.keys(error).length === 0) {
                    addLog('CRITICAL: Empty error object detected - this is the issue!');
                    setError(`Empty error object detected. This is likely a Supabase configuration issue.`);
                  } else {
                    addLog(`Error during test signup: ${JSON.stringify(error)}`);
                    setError(`Test signup failed: ${error.message}`);
                  }
                } else if (data && data.user) {
                  addLog(`Test signup successful! User ID: ${data.user.id}`);
                  setSuccess(`Test signup successful with ${randomEmail}. Check Supabase dashboard.`);
                } else {
                  addLog(`Unusual response: ${JSON.stringify(data)}`);
                  setError('Received unusual response from Supabase.');
                }
              } catch (err) {
                addLog(`Exception during test signup: ${JSON.stringify(err)}`);
                setError('Exception occurred during test signup.');
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 transition-colors flex justify-center items-center"
            disabled={isLoading}
          >
            Run Quick Test Sign-up
          </button>
          
          <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white mt-4 mb-2">Troubleshooting Tips</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>Ensure Supabase email templates are configured correctly</li>
            <li>Check if email confirmation is enabled in Supabase settings</li>
            <li>Verify your email service provider is working</li>
            <li>Check spam/junk folders for confirmation emails</li>
            <li>Ensure your site URL is correctly set in Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
