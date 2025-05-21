'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function OpenAIDebugButton() {
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [openAITestResult, setOpenAITestResult] = useState<{
    success: boolean;
    message: string;
    apiVersion?: string;
    modelsAvailable?: number;
    error?: string;
  } | null>(null);

  // Function to test OpenAI API connection
  const testOpenAIConnection = async () => {
    try {
      setIsTestingOpenAI(true);
      setOpenAITestResult(null);
      
      const response = await fetch('/api/admin/test-openai', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      const result = await response.json();
      setOpenAITestResult(result);
      
      if (result.success) {
        toast.success('OpenAI API connection successful!');
      } else {
        toast.error('OpenAI API connection failed!');
      }
    } catch (error) {
      console.error('Error testing OpenAI API:', error);
      setOpenAITestResult({
        success: false,
        message: 'Error testing OpenAI API',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Error testing OpenAI API');
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  return (
    <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold text-[#1d2939] dark:text-white mb-4">OpenAI API Debug</h3>
      
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={testOpenAIConnection}
          disabled={isTestingOpenAI}
          className="bg-[#2563eb] hover:bg-[#1e40af] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTestingOpenAI ? 'Testing...' : 'Test OpenAI API Connection'}
        </button>
        
        {openAITestResult && (
          <div className={`flex items-center ${openAITestResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <span className="mr-2">
              {openAITestResult.success ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span className="font-medium">{openAITestResult.message}</span>
          </div>
        )}
      </div>
      
      {openAITestResult && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h4 className="text-sm font-medium text-[#1d2939] dark:text-white mb-2">API Details</h4>
          <div className="text-sm text-[#64748b] dark:text-[#94a3b8]">
            {openAITestResult.success ? (
              <>
                <p>API Version: {openAITestResult.apiVersion || 'Unknown'}</p>
                <p>Models Available: {openAITestResult.modelsAvailable || 0}</p>
              </>
            ) : (
              <p>Error: {openAITestResult.error || 'Unknown error'}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}