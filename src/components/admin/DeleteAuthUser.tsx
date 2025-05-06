'use client';

import { useState } from 'react';

export default function DeleteAuthUser() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!userId && !email) {
      setStatus({ success: false, error: 'Please provide either a User ID or Email' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/delete-auth-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ 
          success: true, 
          message: data.message 
        });
        // Clear the inputs on success
        setUserId('');
        setEmail('');
      } else {
        setStatus({ 
          success: false, 
          error: data.error || 'Failed to delete user' 
        });
      }
    } catch (error) {
      setStatus({ 
        success: false, 
        error: 'An unexpected error occurred' 
      });
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Delete Supabase Auth User</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User ID
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter Supabase User ID"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          OR Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <button
        onClick={handleDelete}
        disabled={loading || (!userId && !email)}
        className={`w-full py-2 px-4 rounded-md text-white ${
          loading || (!userId && !email)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {loading ? 'Deleting...' : 'Delete User'}
      </button>
      
      {status && (
        <div className={`mt-4 p-3 rounded-md ${status.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.success ? status.message : status.error}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Warning:</p>
        <p>This action will completely remove the user from Supabase Auth and cannot be undone.</p>
        <p>Make sure you have the correct User ID or email before proceeding.</p>
      </div>
    </div>
  );
}
