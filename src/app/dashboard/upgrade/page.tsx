"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/utils/authUtils";
import { useEffect, useState } from "react";

export default function UpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Check authentication
  useEffect(() => {
    async function checkAuthentication() {
      const user = await checkAuth();
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth');
        return;
      }
      setUser(user);
    }
    
    checkAuthentication();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2563eb]">StageMate AI</h1>
          <nav className="flex items-center">
            <Link href="/dashboard" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white mb-4">Upgrade Your Plan</h2>
            <p className="text-[#475569] dark:text-[#cbd5e1] max-w-2xl mx-auto">
              You've used all your free credits. Upgrade to continue transforming your real estate photos with AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Basic Plan */}
            <div className="bg-[#f8fafc] dark:bg-[#27272a] rounded-xl p-6 border border-[#e5e7eb] dark:border-[#334155] flex flex-col">
              <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Basic</h3>
              <div className="text-3xl font-bold text-[#2563eb] mb-4">$9.99<span className="text-sm text-[#64748b] dark:text-[#94a3b8] font-normal">/month</span></div>
              <ul className="mb-6 flex-grow">
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  20 AI photo transformations
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Standard resolution
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Email support
                </li>
              </ul>
              <button className="w-full py-2 px-4 bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium rounded-md shadow-sm transition-colors">
                Choose Basic
              </button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-[#eff6ff] dark:bg-[#1e3a8a] rounded-xl p-6 border-2 border-[#2563eb] flex flex-col relative">
              <div className="absolute top-0 right-0 bg-[#2563eb] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Pro</h3>
              <div className="text-3xl font-bold text-[#2563eb] mb-4">$19.99<span className="text-sm text-[#64748b] dark:text-[#94a3b8] font-normal">/month</span></div>
              <ul className="mb-6 flex-grow">
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  50 AI photo transformations
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  High resolution
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Custom room styles
                </li>
              </ul>
              <button className="w-full py-2 px-4 bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium rounded-md shadow-sm transition-colors">
                Choose Pro
              </button>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-[#f8fafc] dark:bg-[#27272a] rounded-xl p-6 border border-[#e5e7eb] dark:border-[#334155] flex flex-col">
              <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Premium</h3>
              <div className="text-3xl font-bold text-[#2563eb] mb-4">$39.99<span className="text-sm text-[#64748b] dark:text-[#94a3b8] font-normal">/month</span></div>
              <ul className="mb-6 flex-grow">
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Unlimited AI photo transformations
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Ultra high resolution
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  24/7 priority support
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  White-label downloads
                </li>
                <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  API access
                </li>
              </ul>
              <button className="w-full py-2 px-4 bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium rounded-md shadow-sm transition-colors">
                Choose Premium
              </button>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">
              Need a custom plan for your team or brokerage?
            </p>
            <button className="py-2 px-6 border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white font-medium rounded-md transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
