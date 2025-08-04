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
              src="/images/3.png" 
              alt="StageMate AI Logo" 
              width={140} 
              height={40} 
              className="h-10 w-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {success ? (
            <div className="p-5 mb-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <p className="text-green-700 font-medium">Password reset email sent!</p>
              </div>
              <p className="text-green-600 text-sm mb-4">
                Check your email for a link to reset your password. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="mt-2 w-full rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 transition-colors shadow-md"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {error && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">{error}</p>
                  <p className="text-red-500 text-sm mt-1">
                    If you're having trouble, please contact support at <a href="mailto:support@stagemateai.com" className="underline">support@stagemateai.com</a>
                  </p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 transition-colors flex justify-center items-center shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password? <button 
                    onClick={() => router.push('/auth')} 
                    className="text-blue-700 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Right side - Image with blue gradient background */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-white via-blue-50 to-blue-100 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 max-w-md bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-4 text-center">
              <svg className="w-16 h-16 mx-auto text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Account Recovery</h3>
            <p className="text-gray-600 text-center">
              We'll help you get back into your account quickly and securely.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start mb-4">
                <svg className="w-5 h-5 text-blue-700 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <p className="text-sm text-gray-600">Check your email for a secure reset link</p>
              </div>
              <div className="flex items-start mb-4">
                <svg className="w-5 h-5 text-blue-700 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <p className="text-sm text-gray-600">Create a strong, unique password</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-700 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <p className="text-sm text-gray-600">Sign back in with your new credentials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
