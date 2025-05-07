"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Call Supabase password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      // Show success message
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      setError(err instanceof Error ? err.message : "Failed to send password reset email. Please try again.");
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {success ? (
            <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 font-medium">Password reset email sent!</p>
              <p className="text-green-500 text-sm mt-1">
                Check your email for a link to reset your password. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="mt-4 w-full rounded-md bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 font-medium">{error}</p>
                  <p className="text-red-500 text-sm mt-1">
                    If you're having trouble, please contact support at <a href="mailto:support@stagemateai.com" className="underline">support@stagemateai.com</a>
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ecfc9] focus:border-transparent"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
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
              We'll help you get back into your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
