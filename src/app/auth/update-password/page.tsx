"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Check if we have a valid hash in the URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setError("Invalid or missing recovery link. Please request a new password reset link.");
    }
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Update the password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      // Show success message
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Image 
              src="/logo.svg" 
              alt="StageMate AI Logo" 
              width={40} 
              height={40} 
              className="mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Update Password</h1>
            <p className="text-gray-600">
              Create a new password for your account.
            </p>
          </div>
          
          {success ? (
            <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 font-medium">Password updated successfully!</p>
              <p className="text-green-500 text-sm mt-1">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="mt-4 w-full rounded-md bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 font-medium">{error}</p>
                  <p className="text-red-500 text-sm mt-1">
                    If you're having trouble, please contact support at <a href="mailto:support@stagemateai.com" className="underline">support@stagemateai.com</a>
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="New password"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ecfc9] focus:border-transparent"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ecfc9] focus:border-transparent"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
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
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password? <button 
                    onClick={() => router.push('/auth')} 
                    className="text-[#6ecfc9] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Right side - Image with teal gradient background */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-white via-[#d9f5f2] to-[#6ecfc9] relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 max-w-xl">
            <p className="text-center text-black text-sm mt-4 font-medium">
              Secure your account with a strong password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
