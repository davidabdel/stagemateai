'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the enhanced admin component
// Note: Using dynamic import to handle any client-side only dependencies
const AdminDashboard = dynamic(() => import('./admin-fixed'), {
  ssr: false,
  loading: () => <AdminLoading />
});

// Loading component
function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Admin Dashboard...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we load your dashboard</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminDashboard />
    </Suspense>
  );
}