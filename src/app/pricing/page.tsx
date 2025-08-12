"use client";

import Link from "next/link";
import { useState } from "react";
import TopNav from "../../components/TopNav";

export default function PricingPage() {
  const [billing, setBilling] = useState<"year" | "month">("year");

  const plans = [
    {
      name: "Trial Plan",
      priceYear: 0,
      priceMonth: 0,
      credits: 3,
      features: [
        "Basic virtual staging",
        "Up to 3 images or 7 days (whichever happens first)",
      ],
      cta: { label: "Get Started", href: "/try" },
      badge: "",
    },
    {
      name: "Standard",
      priceYear: 199,
      priceMonth: Math.round(199 * 1.2),
      credits: 100,
      features: [
        "100 AI photo transformations",
        "High resolution images",
        "Priority email support",
      ],
      cta: { label: "Choose Standard", href: "/try" },
      badge: "MOST POPULAR",
    },
    {
      name: "Agency Plan",
      priceYear: 397,
      priceMonth: Math.round(397 * 1.2),
      credits: 300,
      features: [
        "300 AI photo transformations",
        "High resolution images",
        "Priority email support",
      ],
      cta: { label: "Choose Agency", href: "/try" },
      badge: "",
    },
  ];

  const displayPrice = (p: { priceYear: number; priceMonth: number }) =>
    billing === "year" ? p.priceYear : p.priceMonth;

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1f2937]">Upgrade Your Plan</h1>
          <p className="text-[#6b7280] mt-3">You've used all your free credits. Upgrade to continue transforming your real estate photos with AI.</p>
          {/* Toggle */}
          <div className="mt-6 inline-flex items-center rounded-full border border-[#e5e7eb] overflow-hidden shadow-sm">
            <button
              onClick={() => setBilling("month")}
              className={`px-4 py-2 text-sm font-medium transition ${billing === "month" ? "bg-[#2563eb] text-white" : "bg-white text-[#1f2937]"}`}
            >
              Monthly (+20%)
            </button>
            <button
              onClick={() => setBilling("year")}
              className={`px-4 py-2 text-sm font-medium transition ${billing === "year" ? "bg-[#2563eb] text-white" : "bg-white text-[#1f2937]"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isStandard = plan.name === "Standard";
            const isTrial = plan.name === "Trial Plan";
            const price = displayPrice(plan);
            return (
              <div key={plan.name} className="relative rounded-2xl p-6 bg-white border border-[#e5e7eb] shadow-sm">
                {isStandard && (
                  <div className="absolute -top-3 right-4 bg-[#2563eb] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">MOST POPULAR</div>
                )}
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{plan.name}</h3>
                <div className={`text-4xl font-extrabold ${isTrial ? "text-[#6ecfc9]" : "text-[#2563eb]"} mb-1`}>${price}
                  <span className="text-sm font-medium text-[#6b7280]">/{billing === "year" ? "year" : "month"}</span>
                </div>
                <div className="text-sm font-semibold text-[#2563eb] mb-4">{plan.credits} credits</div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start text-[#374151]">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      <span className={`${f.includes("AI photo transformations") ? "font-semibold" : ""}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta.href}
                  className={`block w-full text-center py-2.5 px-4 rounded-md text-white font-medium shadow ${isStandard ? "bg-[#f59e0b] hover:bg-[#d97706]" : "bg-[#2563eb] hover:bg-[#1e40af]"}`}
                >
                  {plan.cta.label}
                </Link>
              </div>
            );
          })}
        </div>

        
      </main>
    </div>
  );
}
