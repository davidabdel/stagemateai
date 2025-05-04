"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

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
  
  async function handleSignUp() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Show confirmation message
      alert("Check your email for the confirmation link!");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      setError("");
      
      // Sign in with Google via Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }
      
      // The redirect is handled by Supabase OAuth flow
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f] px-4">
      <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-[#2563eb] mb-2">Sign in</h2>
        <p className="text-center text-[#64748b] dark:text-[#cbd5e1] mb-6">Welcome back to StageMate AI</p>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="rounded-md border border-[#e5e7eb] dark:border-[#334155] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-[#f8fafc] dark:bg-[#23272f] text-[#1e293b] dark:text-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-md border border-[#e5e7eb] dark:border-[#334155] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-[#f8fafc] dark:bg-[#23272f] text-[#1e293b] dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="rounded-md bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold py-3 transition-colors flex justify-center items-center"
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
        
        <div className="mt-6 pt-6 border-t border-[#e5e7eb] dark:border-[#334155]">
          <p className="text-center text-[#64748b] dark:text-[#cbd5e1] mb-4">Or sign in with</p>
          <button
            onClick={handleGoogleSignIn}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#23272f] text-gray-700 dark:text-white font-medium py-3 transition-colors flex justify-center items-center mb-4 hover:bg-gray-50 dark:hover:bg-gray-800"
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
          
          <div className="mt-4">
            <p className="text-center text-[#64748b] dark:text-[#cbd5e1] mb-4">Don&apos;t have an account?</p>
            <button
              onClick={handleSignUp}
              className="w-full rounded-md border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white font-semibold py-3 transition-colors flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Sign up"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
