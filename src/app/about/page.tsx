"use client";

import TopNav from "../../components/TopNav";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0e7ef] dark:from-[#0a0a0a] dark:to-[#23272f]">
      <TopNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1d2939] dark:text-white mb-3">About StageMate AI</h1>
          <p className="text-[#475569] dark:text-[#cbd5e1]">A quick overview of who we are and what we do.</p>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl shadow border border-[#e5e7eb] dark:border-[#334155] bg-white dark:bg-[#0b1116]">
          {/* 16:9 responsive video container */}
          <div className="relative pt-[56.25%]">
            {/* Replace src with your YouTube embed once available */}
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/vhC_GU9N2n0?rel=0&modestbranding=1"
              title="About StageMate AI"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/try"
            className="inline-flex items-center px-6 py-3 rounded-md text-white font-medium shadow bg-[#2563eb] hover:bg-[#1e40af] transition-colors"
          >
            Try for FREE
          </Link>
        </div>
      </main>
    </div>
  );
}
