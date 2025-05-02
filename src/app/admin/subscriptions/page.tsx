"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { checkAuth } from "@/utils/authUtils";

interface SubscriptionPlan {
  id?: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  is_active: boolean;
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [editForm, setEditForm] = useState<SubscriptionPlan>({
    name: "",
    description: "",
    price: 0,
    credits: 0,
    features: [],
    is_active: true
  });
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    async function checkAdminAuth() {
      setIsLoading(true);
      const user = await checkAuth();
      
      if (!user) {
        router.push('/auth');
        return;
      }
      
      // Check if user has admin role
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) {
        console.error("Not an admin user:", error);
        router.push('/dashboard');
        return;
      }
      
      setIsAdmin(true);
      fetchSubscriptionPlans();
    }
    
    checkAdminAuth();
  }, [router]);

  async function fetchSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      setPlans(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      setIsLoading(false);
    }
  }

  function handleEditPlan(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setEditForm({
      ...plan,
      features: [...plan.features]
    });
    setIsEditing(true);
    setIsCreating(false);
  }

  function handleCreatePlan() {
    setSelectedPlan(null);
    setEditForm({
      name: "",
      description: "",
      price: 0,
      credits: 0,
      features: [],
      is_active: true
    });
    setIsCreating(true);
    setIsEditing(false);
  }

  function handleAddFeature() {
    if (featureInput.trim()) {
      setEditForm({
        ...editForm,
        features: [...editForm.features, featureInput.trim()]
      });
      setFeatureInput("");
    }
  }

  function handleRemoveFeature(index: number) {
    const newFeatures = [...editForm.features];
    newFeatures.splice(index, 1);
    setEditForm({
      ...editForm,
      features: newFeatures
    });
  }

  async function handleSavePlan() {
    try {
      if (isCreating) {
        // Create new plan
        const { error } = await supabase
          .from('subscription_plans')
          .insert([editForm]);
        
        if (error) throw error;
      } else if (isEditing && selectedPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update(editForm)
          .eq('id', selectedPlan.id);
        
        if (error) throw error;
      }
      
      // Refresh plans
      await fetchSubscriptionPlans();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error saving subscription plan:", error);
    }
  }

  async function handleTogglePlanStatus(plan: SubscriptionPlan) {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);
      
      if (error) throw error;
      
      // Refresh plans
      await fetchSubscriptionPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <header className="bg-white dark:bg-[#18181b] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center">
            <img 
              src="/images/3.png" 
              alt="StageMate Logo" 
              style={{ height: '40px', width: 'auto' }}
            />
            <span className="ml-2 text-xl font-bold text-[#1d2939] dark:text-white">Admin</span>
          </Link>
          <nav className="flex items-center">
            <Link href="/admin" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Users
            </Link>
            <Link href="/admin/analytics" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Analytics
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white">Subscription Plans</h2>
            <button
              onClick={handleCreatePlan}
              className="rounded-lg bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold px-4 py-2 text-sm shadow-lg transition-colors"
            >
              + Add New Plan
            </button>
          </div>
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-6 border-2 ${
                  plan.is_active 
                    ? 'border-[#2563eb] dark:border-[#60a5fa]' 
                    : 'border-gray-200 dark:border-gray-700 opacity-70'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white">{plan.name}</h3>
                  <div className="flex items-center">
                    <span 
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        plan.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1d2939] dark:text-white">${plan.price}</span>
                  <span className="text-[#64748b] dark:text-[#94a3b8] ml-1">/ month</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-[#2563eb] font-semibold">{plan.credits} credits</span>
                </div>
                
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-[#2563eb] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[#1d2939] dark:text-white text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 rounded-md bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium px-3 py-2 text-sm shadow-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePlanStatus(plan)}
                    className="flex-1 rounded-md border border-[#e5e7eb] dark:border-[#334155] bg-white dark:bg-[#18181b] text-[#1d2939] dark:text-white font-medium px-3 py-2 text-sm shadow-sm transition-colors"
                  >
                    {plan.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Edit/Create Plan Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-[#1d2939] dark:text-white mb-4">
              {isCreating ? 'Create New Plan' : 'Edit Plan'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  className="w-full bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={2}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                    Price ($/month)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    className="w-full bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2"
                    value={editForm.credits}
                    onChange={(e) => setEditForm({...editForm, credits: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1d2939] dark:text-white mb-1">
                  Features
                </label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-l-md px-3 py-2"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature"
                  />
                  <button
                    onClick={handleAddFeature}
                    className="bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium px-3 py-2 rounded-r-md"
                  >
                    Add
                  </button>
                </div>
                
                <ul className="mt-2 space-y-1">
                  {editForm.features.map((feature, index) => (
                    <li key={index} className="flex justify-between items-center bg-[#f1f5f9] dark:bg-[#27272a] rounded px-3 py-2">
                      <span className="text-sm text-[#1d2939] dark:text-white">{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  className="h-4 w-4 text-[#2563eb] focus:ring-[#2563eb] border-gray-300 rounded"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-[#1d2939] dark:text-white">
                  Active Plan
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-[#1d2939] dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1e40af] text-white rounded-md"
              >
                {isCreating ? 'Create Plan' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
