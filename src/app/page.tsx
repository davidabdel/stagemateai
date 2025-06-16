"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "../components/Logo";
import BeforeAfterSlider from "../components/BeforeAfterSlider";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-[#0052CC]/10 min-h-screen">
      {/* Navigation */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img 
                src="/images/3.png" 
                alt="StageMate Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
            </a>
          </div>
          {/* Navigation links removed */}
          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-gray-700 hover:text-[#0052CC] font-medium">Log In</Link>
            <Link href="/try" className="bg-[#0052CC] hover:bg-[#0052CC]/80 text-white px-4 py-2 rounded-md font-medium transition-colors">Try Free</Link>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="w-full pt-8 pb-8 md:pt-12 md:pb-12 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
              {/* Left side - Header content */}
              <div className="flex flex-col items-start text-left md:w-[45%] gap-6">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block font-extrabold tracking-tight uppercase text-primary">Skip the Photographer.</span>
                  <span className="block font-extrabold tracking-tight uppercase text-primary">List in Minutes</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600">
                  Use StageMate to instantly clean, enhance, and transform your property photos — no staging, no photographers, no delays.
                </p>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  <a href="/try" className="px-6 py-3 bg-[#0052CC] hover:bg-[#0052CC]/80 text-white font-medium rounded-md transition-colors shadow-md">
                    START FREE TRIAL
                  </a>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-6 h-6 -ml-1 first:ml-0 rounded-full bg-[#6ecfc9] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Trusted By Agents Worldwide</span>
                </div>
              </div>
              
              {/* Right side - Before/After Interactive Slider */}
              <div className="md:w-[55%]">
                <div className="relative">
                  <BeforeAfterSlider 
                    beforeImage="/images/After_StageMate.jpeg"
                    afterImage="/images/Before_StageMate.jpeg"
                    beforeAlt="After AI staging - Living room"
                    afterAlt="Before staging - Living room"
                    height={500}
                    width={800}
                  />
                </div>
                <p className="text-center text-gray-500 mt-3 text-sm">
                  Drag the slider to see the transformation
                </p>
              </div>
            </div>
          </div>
        </section>
      
      </main>
      
      {/* Section 2: How It Works */}
      <section className="py-16 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How StageMateAI Works</h2>
            <p className="text-gray-600 mt-4">Simple three-step process to transform your listings</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 bg-[#0052CC]/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-[#0052CC] font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Snap a Photo</h3>
              <p className="text-gray-600 mb-4">Upload any room — even messy ones — from your phone or camera.</p>
              <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <img 
                  src="/images/kidsroom_before.jpeg" 
                  alt="Messy kids room before staging" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 bg-[#0052CC]/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-[#0052CC] font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload to StageMate AI</h3>
              <p className="text-gray-600 mb-4">Our AI removes clutter, enhances lighting, and adds tasteful virtual decor.</p>
              <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <img 
                  src="/images/kidsroom_ai.png" 
                  alt="AI processing the kids room image" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 bg-[#0052CC]/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-[#0052CC] font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Download and List</h3>
              <p className="text-gray-600 mb-4">Download ready-to-go, real-estate perfect images.</p>
              <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <img 
                  src="/images/kidsroom_after.png" 
                  alt="Beautifully staged kids room after AI processing" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/auth" className="inline-block rounded-md bg-[#0052CC] hover:bg-[#0052CC]/80 text-white font-medium px-6 py-3 shadow-md transition-all">
              Transform Your First Photo Free
            </Link>
          </div>
        </div>
      </section>
      
      {/* Section 3: Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Agents Love StageMateAI</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Join thousands of real estate professionals who are saving time and money</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0052CC]/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">List Properties Faster</h3>
                <p className="text-gray-600">No waiting for photographers — get listings online immediately.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0052CC]/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Thousands</h3>
                <p className="text-gray-600">Eliminate photography and staging fees completely.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0052CC]/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">Upload from your phone in minutes, no technical skills needed.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0052CC]/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Always On</h3>
                <p className="text-gray-600">Works 24/7, whenever you need it, no scheduling required.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0052CC]/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Higher Selling Prices</h3>
                <p className="text-gray-600">Showcase listings at their best to attract premium offers.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Join agents who are getting homes market-ready without lifting a finger.</p>
            <Link href="/auth" className="inline-block rounded-md bg-[#0052CC] hover:bg-[#0052CC]/80 text-white font-medium px-6 py-3 shadow-md transition-all">
              Get Started Free Today
            </Link>
          </div>
        </div>
      </section>
      
      {/* Section 4: Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Real estate agents are transforming their business with StageMateAI</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="h-8 w-8 text-[#0052CC]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg mb-6 flex-grow">"StageMateAI helped me list homes 3x faster and saved me over $2,000 last month alone."</p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-900">Sarah M.</p>
                  <p className="text-gray-500 text-sm">Top Selling Agent</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="h-8 w-8 text-[#0052CC]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-lg mb-6 flex-grow">"It's like having a professional stager and photographer in my pocket."</p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-900">James L.</p>
                  <p className="text-gray-500 text-sm">R1 Agency Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing section removed */}
      
      {/* Section 6: Final CTA */}
      <section className="py-20 bg-white" id="contact">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 py-12 px-6 shadow-md">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to See the Magic?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Upload your first messy room photo — and watch StageMateAI transform it in minutes.</p>
            
            <Link href="/auth" className="inline-block rounded-md bg-[#0052CC] hover:bg-[#0052CC]/80 text-white font-semibold px-8 py-4 text-xl shadow-md transition-all transform hover:scale-105 mb-8">
              Try StageMateAI FREE Now
            </Link>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-[#0052CC] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-[#0052CC] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Instant access</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-[#0052CC] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Transform photos in under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section removed */}
      
      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img 
                src="/images/3.png" 
                alt="StageMate Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-[#0052CC]">Terms</Link>
              <Link href="#" className="text-gray-600 hover:text-[#0052CC]">Privacy</Link>
              <Link href="/support" className="text-gray-600 hover:text-[#0052CC]">Support</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} StageMateAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
