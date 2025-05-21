'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminNavLinks() {
  return (
    <div className="flex space-x-4 items-center">
      <Link 
        href="/admin/debug" 
        className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md text-sm font-medium transition-colors"
      >
        OpenAI Debug Tools
      </Link>
    </div>
  );
}