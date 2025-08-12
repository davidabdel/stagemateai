"use client";

import Link from "next/link";

export default function TopNav() {
  return (
    <header className="bg-white dark:bg-[#18181b] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img src="/images/3.png" alt="StageMate Logo" style={{ height: 40 }} />
        </Link>
        <nav className="flex items-center space-x-6 text-sm">
          <Link href="/" className="text-[#64748b] hover:text-[#2563eb]">Home</Link>
          <Link href="/pricing" className="text-[#64748b] hover:text-[#2563eb]">Pricing</Link>
          <Link href="/auth" className="text-[#64748b] hover:text-[#2563eb]">Sign In</Link>
        </nav>
      </div>
    </header>
  );
}
