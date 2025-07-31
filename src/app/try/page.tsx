"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { useRouter } from "next/navigation";

export default function TryForFreePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      console.log('Attempting to sign up with:', { email });
      
      // First try to sign in with the credentials (in case user already exists)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!signInError && signInData?.user) {
        console.log('User already exists, signed in successfully');
        router.push("/dashboard");
        return;
      }
      
      console.log('Sign in failed, attempting to sign up');
      
      // If sign in fails, try to sign up with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // If we get the database error, try a different approach
        if (error.message.includes('Database error')) {
          alert('We encountered an issue with signup. Please try again later or contact support.');
          return;
        }
        
        throw error;
      }
      
      console.log('Signup result:', data);
      
      // Create user records in our database tables
      if (data?.user) {
        try {
          console.log('Creating user records for:', data.user.id, email, name);
          
          // Call our API to create user records
          const createUserResponse = await fetch('/api/create-user-records', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: email,
              name: name
            })
          });
          
          const createUserResult = await createUserResponse.json();
          console.log('Create user records result:', createUserResult);
          
          if (!createUserResponse.ok) {
            console.error('Failed to create user records:', createUserResult);
          }
        } catch (recordError) {
          console.error('Error creating user records:', recordError);
          // Continue despite error - user was created in auth
        }
        
        // Show success message
        alert("Account created successfully! Please check your email for confirmation instructions.");
        setEmail("");
        setPassword("");
        setName("");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get the current domain (works in both development and production)
      const domain = window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${domain}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      setError(error.message || "An error occurred during Google sign in");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Sign up form */}
      <div className="flex flex-col justify-center items-center p-8 md:p-16 w-full md:w-1/2">
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
          
          <h1 className="text-2xl font-bold mb-6">Try StageMate AI for Free</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-4 mb-4 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>
          
          {/* Sign Up Form */}
          <form onSubmit={handleSignUp}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6ecfc9]"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6ecfc9]"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6ecfc9]"
                placeholder="Create a password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6ecfc9] text-black font-medium py-2 px-4 rounded-md hover:bg-[#5dbfb9] transition-colors"
            >
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/auth" className="text-[#6ecfc9] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
      
      {/* Right side - Image slider with teal gradient background */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-white via-[#d9f5f2] to-[#6ecfc9] relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 max-w-xl">
            <BeforeAfterSlider 
              beforeImage="/images/staged-4.png"
              afterImage="/images/empty_4.jpg"
              beforeAlt="After AI staging - Kids room"
              afterAlt="Before staging - Kids room"
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
