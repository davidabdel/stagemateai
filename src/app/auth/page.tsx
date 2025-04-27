"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successful login
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Show confirmation message
      alert("Check your email for the confirmation link!");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
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
            onChange={e => setPassword(e.target.value)}
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
          <p className="text-center text-[#64748b] dark:text-[#cbd5e1] mb-4">Don't have an account?</p>
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
  );
}
