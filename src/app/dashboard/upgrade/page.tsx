"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/utils/authUtils";
import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  is_active: boolean;
  stripe_price_id: string; // required for Stripe checkout
}

export default function UpgradePage() {
  const router = useRouter();
  // Store authenticated user information
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Check authentication and fetch plans
  useEffect(() => {
    async function checkAuthAndFetchPlans() {
      // Check authentication
      const currentUser = await checkAuth();
      if (!currentUser) {
        // Redirect to login if not authenticated
        router.push('/auth');
        return;
      }
      setUser(currentUser);
      
      // Fetch subscription plans
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
        
        if (error) throw error;
        
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthAndFetchPlans();
  }, [router]);
  
  // Handle Stripe checkout
  const handleCheckout = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) throw new Error('Plan not found');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: selectedPlan.stripe_price_id }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      const data = await response.json();
      if (!data.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (error) {
      console.error('Error redirecting to Stripe:', error);
      alert('Failed to start checkout. Please try again.');
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            <img 
              src="/images/3.png" 
              alt="StageMate Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
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
              You&apos;ve used all your free credits. Upgrade to continue transforming your real estate photos with AI.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#64748b] dark:text-[#94a3b8]">
                No subscription plans available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                // Determine if this is the featured plan (middle plan or second plan if only two)
                const isFeatured = plans.length === 3 ? index === 1 : 
                                  plans.length === 2 ? index === 1 : false;
                
                return (
                  <div 
                    key={plan.id}
                    className={`${isFeatured 
                      ? 'bg-[#eff6ff] dark:bg-[#1e3a8a] border-2 border-[#2563eb]' 
                      : 'bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155]'} 
                      rounded-xl p-6 flex flex-col relative`}
                  >
                    {isFeatured && (
                      <div className="absolute top-0 right-0 bg-[#2563eb] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        BEST VALUE
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-[#2563eb] mb-4">
                      ${plan.price}<span className="text-sm text-[#64748b] dark:text-[#94a3b8] font-normal">/month</span>
                    </div>
                    <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-[#2563eb] font-semibold">{plan.credits} credits</span>
                    </div>
                    <ul className="mb-6 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className={isFeatured && featureIndex === 0 ? 'font-semibold' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full py-2 px-4 ${selectedPlan === plan.id ? 'bg-green-500 hover:bg-green-600' : 'bg-[#2563eb] hover:bg-[#1e40af]'} text-white font-medium rounded-md shadow-sm transition-colors flex justify-center items-center`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={selectedPlan !== null}
                    >
                      {selectedPlan === plan.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        `Choose ${plan.name} Plan`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
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
