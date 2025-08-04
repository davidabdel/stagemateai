"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      console.log('Auth page: User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successful login
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleSignUp() {
    // Instead of trying to sign up the user here, redirect them to the /try page
    router.push('/try');
  }
  
  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      setError("");
      
      // Get the current domain for redirection
      const currentDomain = window.location.origin;
      console.log('Auth page: Current domain for redirect:', currentDomain);
      
      // Set redirect to our callback page which will handle the auth response
      const callbackUrl = `${currentDomain}/auth/callback`;
      console.log('Auth page: Callback URL:', callbackUrl);
      
      // Sign in with Google via Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: false,
          // Configure query parameters for Google OAuth
          queryParams: {
            prompt: 'consent'
            // We're using the default authorization code flow, not specifying response_type
          }
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Auth page: OAuth sign-in initiated, URL:', data?.url);
      // The redirect is handled by Supabase OAuth flow
      // No need to set isLoading to false as we're redirecting away
    } catch (err: unknown) {
      console.error("Auth page: Google sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col justify-center items-center p-8 md:p-16 w-full max-w-xl mx-auto">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img 
            src="/images/3.png" 
            alt="StageMate AI Logo" 
            width={140} 
            height={40} 
            className="h-10 w-auto mx-auto"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center">
          <span className="block font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400">
            Welcome Back
          </span>
        </h1>

        <div className="h-16"></div>
        
        <div className="w-full max-w-md">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-700 font-medium py-3 transition-colors flex justify-center items-center mb-6 hover:bg-gray-50 shadow-sm"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-sm text-gray-500">OR</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
          
          {/* Email/Password Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <button 
                  onClick={() => router.push('/auth/reset-password')} 
                  className="text-sm text-blue-700 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            {error && (
              <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-red-500 text-sm mt-1">
                  If you're having trouble, please try again or contact support at <a href="mailto:support@stagemateai.com" className="underline">support@stagemateai.com</a>
                </p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400 hover:from-blue-900 hover:via-gray-700 hover:to-amber-500 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <button 
                onClick={() => router.push('/try')} 
                className="text-blue-700 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
