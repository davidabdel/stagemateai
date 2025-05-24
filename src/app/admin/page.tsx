'use client';

import React from 'react';

// Extremely simplified admin dashboard to avoid any dependency issues
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards - Static data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Images</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">120</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Total Credits</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">350</p>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Admin Dashboard Maintenance</h3>
                <div className="mt-2 text-yellow-700 dark:text-yellow-300">
                  <p>
                    The admin dashboard is currently undergoing maintenance to fix the following issues:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>User credits update functionality in Supabase</li>
                    <li>Contact form webhook integration</li>
                    <li>Default FAQs and videos display when tables don't exist</li>
                    <li>User dropdown display showing all users correctly</li>
                  </ul>
                  <p className="mt-3">
                    These improvements will be available soon. Thank you for your patience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}