import React from 'react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                className="py-4 px-6 text-center border-b-2 font-medium text-sm border-blue-500 text-blue-600 dark:text-blue-400"
              >
                User Management
              </button>
              <button
                className="py-4 px-6 text-center border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Video Tutorials
              </button>
              <button
                className="py-4 px-6 text-center border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                FAQs
              </button>
            </nav>
          </div>

          <div className="p-6">
            <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
              <h3 className="text-lg font-bold mb-2">🚧 Admin Dashboard Under Maintenance</h3>
              <p>We're currently updating the admin dashboard to provide you with better features and improved performance.</p>
              <p className="mt-2">For now, you can access the full admin functionality on your local development environment.</p>
              <p className="mt-4 text-sm">If you need immediate assistance, please contact support.</p>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User List */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Users</h3>
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>

                {/* User Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Details</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select a user to view details</p>
                </div>

                {/* Add Credits */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Credits</h3>
                  <p className="text-gray-500 dark:text-gray-400">Select a user to add credits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}