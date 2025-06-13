"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function DebugPage() {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('check_tables');
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  
  async function fetchDatabaseInfo() {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug-database?action=${action}`);
      const data = await response.json();
      setDbInfo(data);
    } catch (error) {
      console.error('Error fetching database info:', error);
      setDbInfo({ error: String(error) });
    } finally {
      setLoading(false);
    }
  }
  
  async function testSignUp() {
    if (!testEmail || !testPassword) {
      setTestResult({ error: 'Email and password are required' });
      return;
    }
    
    setTestLoading(true);
    setTestResult(null);
    
    try {
      // Step 1: Sign up with Supabase Auth
      const authResult = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      const step1Result = {
        success: !authResult.error,
        data: authResult.data ? {
          id: authResult.data.user?.id,
          email: authResult.data.user?.email,
          created_at: authResult.data.user?.created_at,
        } : null,
        error: authResult.error ? authResult.error.message : null
      };
      
      // If auth signup succeeded, try to create user records
      let step2Result = null;
      if (step1Result.success && authResult.data.user) {
        try {
          const userId = authResult.data.user.id;
          const email = authResult.data.user.email || '';
          
          // Step 2: Call our API to create user records
          const response = await fetch('/api/create-user-records', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              email
            }),
          });
          
          const apiResult = await response.json();
          step2Result = {
            success: apiResult.success,
            data: apiResult,
            error: apiResult.error || null
          };
        } catch (apiError: any) {
          step2Result = {
            success: false,
            data: null,
            error: apiError.message || String(apiError)
          };
        }
      }
      
      setTestResult({
        timestamp: new Date().toISOString(),
        auth: step1Result,
        api: step2Result
      });
    } catch (error: any) {
      setTestResult({
        timestamp: new Date().toISOString(),
        error: error.message || String(error)
      });
    } finally {
      setTestLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Database Debugging</h1>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Database Information</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Action:</label>
          <select 
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="check_tables">Check Tables</option>
            <option value="schemas">Get Schemas</option>
            <option value="test_insert">Test Insert</option>
            <option value="all">All Actions</option>
          </select>
        </div>
        
        <button
          onClick={fetchDatabaseInfo}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Fetch Database Info'}
        </button>
        
        {dbInfo && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Results:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(dbInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Test User Signup</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Test Email:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="border p-2 rounded w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Test Password:</label>
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="password"
            className="border p-2 rounded w-full"
          />
        </div>
        
        <button
          onClick={testSignUp}
          disabled={testLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {testLoading ? 'Testing...' : 'Test Signup Process'}
        </button>
        
        {testResult && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
