"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { checkAuth } from "@/utils/authUtils";

interface AnalyticsData {
  dailySignups: { date: string; count: number }[];
  dailyListings: { date: string; count: number }[];
  dailyCreditsUsed: { date: string; count: number }[];
  planDistribution: { plan: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailySignups: [],
    dailyListings: [],
    dailyCreditsUsed: [],
    planDistribution: []
  });
  const [timeRange, setTimeRange] = useState("30"); // days

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
      fetchAnalyticsData(parseInt(timeRange));
    }
    
    checkAdminAuth();
  }, [router, timeRange]);

  async function fetchAnalyticsData(days: number) {
    try {
      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();
      
      // Fetch daily signups
      const { data: signupData, error: signupError } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDateStr);
      
      if (signupError) throw signupError;
      
      // Fetch daily listings
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('created_at')
        .gte('created_at', startDateStr);
      
      if (listingError) throw listingError;
      
      // Fetch daily credits used
      const { data: creditData, error: creditError } = await supabase
        .from('credit_usage_logs')
        .select('created_at, credits_used')
        .gte('created_at', startDateStr);
      
      if (creditError) throw creditError;
      
      // Fetch plan distribution
      const { data: planData, error: planError } = await supabase
        .from('user_usage')
        .select('plan_type');
      
      if (planError) throw planError;
      
      // Process data for charts
      const dailySignups = processDateData(signupData || [], 'created_at', days);
      const dailyListings = processDateData(listingData || [], 'created_at', days);
      const dailyCreditsUsed = processCreditsData(creditData || [], days);
      const planDistribution = processPlanData(planData || []);
      
      setAnalyticsData({
        dailySignups,
        dailyListings,
        dailyCreditsUsed,
        planDistribution
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setIsLoading(false);
    }
  }

  // Helper function to process date-based data
  function processDateData(data: any[], dateField: string, days: number): { date: string; count: number }[] {
    const dateMap = new Map<string, number>();
    
    // Initialize all dates in range with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    
    // Count items per date
    data.forEach(item => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      if (dateMap.has(date)) {
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Helper function to process credits data
  function processCreditsData(data: any[], days: number): { date: string; count: number }[] {
    const dateMap = new Map<string, number>();
    
    // Initialize all dates in range with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    
    // Sum credits per date
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (dateMap.has(date)) {
        dateMap.set(date, (dateMap.get(date) || 0) + (item.credits_used || 1));
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Helper function to process plan data
  function processPlanData(data: any[]): { plan: string; count: number }[] {
    const planMap = new Map<string, number>();
    
    // Count users per plan
    data.forEach(item => {
      const plan = item.plan_type || 'free';
      planMap.set(plan, (planMap.get(plan) || 0) + 1);
    });
    
    // Convert map to array
    return Array.from(planMap.entries())
      .map(([plan, count]) => ({ 
        plan: plan.charAt(0).toUpperCase() + plan.slice(1), 
        count 
      }));
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
            <Link href="/admin/subscriptions" className="text-[#64748b] dark:text-[#cbd5e1] hover:text-[#2563eb] dark:hover:text-[#60a5fa] mx-4">
              Subscriptions
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-3xl font-bold text-[#1d2939] dark:text-white">Analytics</h2>
            <div>
              <select
                className="bg-[#f8fafc] dark:bg-[#27272a] border border-[#e5e7eb] dark:border-[#334155] rounded-md px-3 py-2 text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
          
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Signups Chart */}
            <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white mb-4">User Signups</h3>
              <div className="h-64 relative">
                {analyticsData.dailySignups.length > 0 ? (
                  <div className="flex h-full items-end">
                    {analyticsData.dailySignups.map((item, index) => {
                      const maxCount = Math.max(...analyticsData.dailySignups.map(d => d.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div 
                          key={index}
                          className="flex-1 mx-1 group relative"
                        >
                          <div 
                            className="bg-[#2563eb] rounded-t-sm transition-all duration-300"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1d2939] dark:bg-[#e5e7eb] text-white dark:text-[#1d2939] text-xs rounded py-1 px-2 whitespace-nowrap">
                            {new Date(item.date).toLocaleDateString()} - {item.count} users
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#64748b] dark:text-[#94a3b8]">No data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Daily Listings Chart */}
            <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white mb-4">New Listings</h3>
              <div className="h-64 relative">
                {analyticsData.dailyListings.length > 0 ? (
                  <div className="flex h-full items-end">
                    {analyticsData.dailyListings.map((item, index) => {
                      const maxCount = Math.max(...analyticsData.dailyListings.map(d => d.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div 
                          key={index}
                          className="flex-1 mx-1 group relative"
                        >
                          <div 
                            className="bg-[#10b981] rounded-t-sm transition-all duration-300"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1d2939] dark:bg-[#e5e7eb] text-white dark:text-[#1d2939] text-xs rounded py-1 px-2 whitespace-nowrap">
                            {new Date(item.date).toLocaleDateString()} - {item.count} listings
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#64748b] dark:text-[#94a3b8]">No data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Daily Credits Used Chart */}
            <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white mb-4">Credits Used</h3>
              <div className="h-64 relative">
                {analyticsData.dailyCreditsUsed.length > 0 ? (
                  <div className="flex h-full items-end">
                    {analyticsData.dailyCreditsUsed.map((item, index) => {
                      const maxCount = Math.max(...analyticsData.dailyCreditsUsed.map(d => d.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div 
                          key={index}
                          className="flex-1 mx-1 group relative"
                        >
                          <div 
                            className="bg-[#f59e0b] rounded-t-sm transition-all duration-300"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1d2939] dark:bg-[#e5e7eb] text-white dark:text-[#1d2939] text-xs rounded py-1 px-2 whitespace-nowrap">
                            {new Date(item.date).toLocaleDateString()} - {item.count} credits
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#64748b] dark:text-[#94a3b8]">No data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Plan Distribution Chart */}
            <div className="bg-[#f1f5f9] dark:bg-[#27272a] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1d2939] dark:text-white mb-4">Subscription Plans</h3>
              <div className="h-64 flex items-center justify-center">
                {analyticsData.planDistribution.length > 0 ? (
                  <div className="w-full max-w-md">
                    {analyticsData.planDistribution.map((item, index) => {
                      const total = analyticsData.planDistribution.reduce((sum, item) => sum + item.count, 0);
                      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                      
                      const colors = [
                        'bg-[#2563eb]', // Blue for Free
                        'bg-[#10b981]', // Green for Basic
                        'bg-[#8b5cf6]', // Purple for Pro
                        'bg-[#f59e0b]'  // Yellow for Enterprise
                      ];
                      
                      return (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-[#1d2939] dark:text-white">{item.plan}</span>
                            <span className="text-sm font-medium text-[#1d2939] dark:text-white">{percentage}% ({item.count})</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`${colors[index % colors.length]} h-2.5 rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#64748b] dark:text-[#94a3b8]">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
