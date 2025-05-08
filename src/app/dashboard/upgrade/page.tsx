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
  const [userCredits, setUserCredits] = useState<{ photos_limit: number; photos_used: number; plan_type: string; email?: string; subscription_status?: string; cancellation_date?: string; subscription_end_date?: string } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Function to fetch user credits
  const fetchUserCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      setUserCredits(data);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

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
      
      // Fetch user credits
      await fetchUserCredits(currentUser.id);
      
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
      console.log('Starting checkout process for plan:', planId);
      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) {
        console.error('Plan not found:', planId, 'Available plans:', plans);
        throw new Error('Plan not found');
      }
      
      console.log('Selected plan:', selectedPlan, 'Stripe price ID:', selectedPlan.stripe_price_id);

      // We'll let Stripe collect the email during checkout
      console.log('Proceeding to Stripe checkout where user will enter email if needed');
      
      // Use the direct checkout endpoint that doesn't rely on Clerk authentication
      const response = await fetch('/api/direct-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId: selectedPlan.stripe_price_id,
          userId: user?.id || ''
        }),
      });

      console.log('Checkout API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create checkout session: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Checkout session data:', data);
      
      if (!data.url) {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL returned');
      }
      
      console.log('Redirecting to checkout URL:', data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error redirecting to Stripe:', error);
      alert('Failed to start checkout. Please try again.');
      setSelectedPlan(null);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setIsCancelling(true);
    setCancelError(null);
    
    try {
      console.log('Canceling subscription for user:', user.id);
      
      // Call the API to cancel the subscription
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id 
        }),
      });
      
      // Get the response data regardless of status
      const responseData = await response.json();
      console.log('Cancel subscription response:', responseData);
      
      if (!response.ok) {
        // If the API returned an error message, use it
        throw new Error(responseData.error || 'Failed to cancel subscription');
      }
      
      // Subscription cancelled successfully
      console.log('Subscription successfully marked for cancellation');
      
      // Update the local state to reflect the cancellation with the data from the API response
      if (userCredits) {
        setUserCredits({
          ...userCredits,
          subscription_status: 'canceled',
          cancellation_date: new Date().toISOString(),
          subscription_end_date: responseData.subscription_end_date || null
        });
      }
      
      // Close the modal and show a success message
      setShowCancelConfirm(false);
      alert(responseData.message || 'Your subscription has been successfully canceled. Your current plan will remain active until the end of your billing period.');
      
      // Refresh user data instead of reloading the page
      if (user) {
        await fetchUserCredits(user.id);
      }
      
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      setCancelError(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
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
              {userCredits && userCredits.plan_type === "trial" 
                ? "You've used all your free credits. Upgrade to continue transforming your real estate photos with AI."
                : "Manage your subscription plan to better suit your needs."}
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
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12 max-w-6xl mx-auto">
              {/* Trial Plan Card - Only show for trial users */}
              {userCredits && (userCredits.plan_type === "trial" || userCredits.plan_type === "Trial") && (
              <div className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-xl p-6 flex flex-col relative">
                <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-2">Trial Plan</h3>
                <div className="text-3xl font-bold text-[#6ecfc9] mb-4">
                  $0<span className="text-sm text-[#64748b] dark:text-[#94a3b8] font-normal">/month</span>
                </div>
                <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">Get started with basic features</p>
                <div className="mb-4">
                  <span className="text-[#6ecfc9] font-semibold">3 credits</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-[#64748b] dark:text-[#94a3b8]">Credits Used</span>
                    <span className="text-sm text-[#64748b] dark:text-[#94a3b8]">
                      {userCredits ? userCredits.photos_used : 0}/{userCredits ? userCredits.photos_limit : 3}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-[#6ecfc9] h-2.5 rounded-full" 
                      style={{ width: userCredits ? `${Math.min(100, (userCredits.photos_used / Math.max(1, userCredits.photos_limit)) * 100)}%` : '0%' }}
                    ></div>
                  </div>
                  <div className="mt-1 text-sm text-[#64748b] dark:text-[#94a3b8]">
                    {userCredits ? Math.max(0, userCredits.photos_limit - userCredits.photos_used) : 3} credits remaining
                  </div>
                </div>
                <ul className="mb-6 flex-grow">
                  <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Basic virtual staging</span>
                  </li>
                  <li className="flex items-center mb-2 text-[#475569] dark:text-[#cbd5e1]">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>3 photos per month</span>
                  </li>
                </ul>
                <div className="absolute top-0 right-0 bg-[#6ecfc9] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  CURRENT PLAN
                </div>
                <button 
                  className="w-full py-2 px-4 bg-gray-300 text-gray-600 font-medium rounded-md shadow-sm cursor-not-allowed"
                  disabled
                >
                  Current Plan
                </button>
              </div>
              )}
              
              {plans.map((plan, index) => {
                // Determine if this is the featured plan (middle plan or second plan if only two)
                const isFeatured = plans.length === 3 ? index === 1 : 
                                  plans.length === 2 ? index === 1 : false;
                
                // Check if this is the user's current plan
                const isCurrentPlan = userCredits ? 
                  (userCredits.plan_type === "agency" && plan.name === "Agency Plan") || 
                  (userCredits.plan_type === "standard" && plan.name === "Standard")
                  : false;
                // Check if this is the Agency Plan
                const isAgencyPlan = plan.name === "Agency Plan";
                // Check if this is the Standard Plan
                const isStandardPlan = plan.name === "Standard";
                
                return (
                  <div 
                    key={plan.id}
                    className={`${isCurrentPlan 
                      ? 'bg-[#eff6ff] dark:bg-[#1e3a8a] border-2 border-[#2563eb]' 
                      : 'bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155]'} 
                      rounded-xl p-6 flex flex-col relative`}
                  >
                    {isCurrentPlan && (
                      <div className={`absolute top-0 right-0 ${userCredits?.subscription_status === 'canceled' ? 'bg-red-500' : 'bg-[#6ecfc9]'} text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg`}>
                        {userCredits?.subscription_status === 'canceled' ? 'CANCELED' : 'CURRENT PLAN'}
                      </div>
                    )}
                    {/* Show subscription end date if canceled */}
                    {isCurrentPlan && userCredits?.subscription_status === 'canceled' && userCredits?.subscription_end_date && (
                      <div className="mt-2 text-xs text-red-500 font-medium">
                        Active until: {new Date(userCredits.subscription_end_date).toLocaleDateString()}
                      </div>
                    )}
                    {isFeatured && !isAgencyPlan && (
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
                    {isCurrentPlan ? (
                      <button 
                        className="w-full py-2 px-4 bg-gray-300 text-gray-600 font-medium rounded-md shadow-sm cursor-not-allowed"
                        disabled
                      >
                        {userCredits?.subscription_status === 'canceled' ? 'Canceled Plan' : 'Current Plan'}
                      </button>
                    ) : plan.name === "Standard" ? (
                      <button 
                        className={`w-full py-2 px-4 ${selectedPlan === plan.id ? 'bg-green-500 hover:bg-green-600' : 'bg-[#f59e0b] hover:bg-[#d97706]'} text-white font-medium rounded-md shadow-sm transition-colors flex justify-center items-center`}
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
                          `${userCredits?.plan_type === 'free' || userCredits?.plan_type === 'trial' ? 'Upgrade' : 'Downgrade'} to ${plan.name}`
                        )}
                      </button>
                    ) : (
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
                    )}
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
            {userCredits && userCredits.plan_type !== "trial" && userCredits.plan_type !== "Trial" && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Processing...' : 'Cancel my plan'}
                </button>
                
                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#18181b] rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cancel Your Subscription</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Are you sure you want to cancel your subscription?
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        <strong>Your existing credits will remain available</strong> until the end of your current billing period. After that, you'll be downgraded to the trial plan.
                      </p>
                      {cancelError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                          {cancelError}
                        </div>
                      )}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                          disabled={isCancelling}
                        >
                          Keep Subscription
                        </button>
                        <button
                          onClick={handleCancelSubscription}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            'Yes, Cancel Subscription'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
