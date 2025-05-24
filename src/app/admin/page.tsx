'use client';

import React from 'react';
import AdminDashboard from './admin-fixed';
import { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AdminDashboard />
    </>
  );
}