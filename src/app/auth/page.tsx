"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      console.log('Current domain for redirect:', currentDomain);
      
      // Ensure we're using the full domain for the redirect
      const redirectUrl = `${currentDomain}/dashboard`;
      console.log('Redirect URL:', redirectUrl);
      
      // Sign in with Google via Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Explicitly set the site URL to match the current domain
          // This helps ensure the redirect goes back to the right place
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // The redirect is handled by Supabase OAuth flow
      // If you're still getting redirected to localhost, check your Supabase Site URL setting
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/images/AIStars.png" 
              alt="StageMate AI Logo" 
              width={120} 
              height={40} 
              className="h-10 w-auto"
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-6">Sign in</h1>
          
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full rounded-md border border-gray-300 bg-white text-gray-700 font-medium py-3 transition-colors flex justify-center items-center mb-6 hover:bg-gray-50"
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
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-sm text-gray-500">OR</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          {/* Email/Password Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ecfc9] focus:border-transparent"
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
                  className="text-sm text-[#6ecfc9] hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ecfc9] focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-red-500 text-sm mt-1">
                  If you're having trouble, please try again or contact support at <a href="mailto:support@stagemateai.com" className="underline">support@stagemateai.com</a>
                </p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full rounded-md bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors flex justify-center items-center mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <button 
                onClick={() => router.push('/try')} 
                className="text-[#6ecfc9] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Image slider with teal gradient background */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-white via-[#d9f5f2] to-[#6ecfc9] relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 max-w-xl">
            <BeforeAfterSlider 
              beforeImage="/images/staged-4.png"
              afterImage="/images/empty_4.jpg"
              beforeAlt="After"
              afterAlt="Before"
              height={500}
              width={800}
            />
            <p className="text-center text-black text-sm mt-4 font-medium">
              See the transformation with StageMate AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
