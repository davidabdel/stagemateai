import Link from "next/link";
import Image from "next/image";
import { BeamsBackground } from "@/components/ui/beams-background";

export default function Home() {
  return (
    <BeamsBackground intensity="strong">
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="w-full text-white pt-16 pb-8 md:pt-24 md:pb-12 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm border border-white/20 bg-black/20 backdrop-blur-md">
                <span className="text-gray-300">AI-Powered Virtual Staging</span>
                <a href="/auth" className="flex items-center gap-1 ml-2 text-orange-300">
                  Try it free
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg leading-tight max-w-5xl w-[120%] mx-auto">
                Instantly Turn Messy Homes<br />into Market-Ready Listings
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                Upload a photo. Watch AI clean, stage, and enhance it — in seconds. No photographers. No staging fees.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <a href="/auth" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors">
                  TRY FOR FREE
                </a>
              </div>
              
              {/* Before/After Showcase */}
              <div className="w-full mt-12">

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                  {/* The "BEFORE" image */}
                  <div className="flex justify-center items-center w-full md:w-2/5">
                    <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: '480px', maxWidth: '100%' }}>
                      <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        BEFORE
                      </div>
                      <img 
                        src="/images/Before_StageMate.jpeg?v=3" 
                        alt="Before staging - Living room" 
                        width="480" 
                        height="336"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  {/* Arrow pointing from before to after */}
                  <div className="flex items-center justify-center py-4 md:py-0">
                    <div className="hidden md:flex md:items-center md:justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div className="flex md:hidden items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* The "AFTER" image */}
                  <div className="flex justify-center items-center w-full md:w-3/5">
                    <div className="relative rounded-lg overflow-hidden shadow-2xl transform scale-100" style={{ width: '650px', maxWidth: '100%' }}>
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        AFTER
                      </div>
                      <img 
                        src="/images/After_StageMate.jpeg?v=6" 
                        alt="After AI staging - Living room" 
                        width="650" 
                        height="455"
                        className="w-full h-auto"
                        style={{ transform: 'scale(1.08)', transformOrigin: 'center center' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Section 2: How It Works */}
      <section className="py-16 bg-transparent text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How StageMateAI Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-white/10 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-orange-400 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Snap a Photo</h3>
              <p className="text-gray-300">Upload any room — even messy ones — from your phone or camera.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-white/10 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-orange-400 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Cleans and Stages</h3>
              <p className="text-gray-300">Our AI removes clutter, enhances lighting, and adds tasteful virtual decor.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-white/10 transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-orange-400 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Download and List</h3>
              <p className="text-gray-300">Download ready-to-go, real-estate perfect images.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/auth" className="inline-block rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 shadow-lg transition-all">
              Transform Your First Photo Free
            </Link>
          </div>
        </div>
      </section>
      
      {/* Section 3: Benefits */}
      <section className="py-16 bg-black/20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Why Agents Love StageMateAI</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">List Properties Faster</h3>
                <p className="text-gray-300">No waiting for photographers — get listings online immediately.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Save Thousands</h3>
                <p className="text-gray-300">Eliminate photography and staging fees completely.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Easy to Use</h3>
                <p className="text-gray-300">Upload from your phone in minutes, no technical skills needed.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Always On</h3>
                <p className="text-gray-300">Works 24/7, whenever you need it, no scheduling required.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Higher Selling Prices</h3>
                <p className="text-gray-300">Showcase listings at their best to attract premium offers.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Join agents who are getting homes market-ready without lifting a finger.</p>
            <Link href="/auth" className="inline-block rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 shadow-lg transition-all">
              Get Started Free Today
            </Link>
          </div>
        </div>
      </section>
      
      {/* Section 4: Testimonials */}
      <section className="py-16 bg-transparent text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-white/10">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="h-8 w-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-lg mb-6 flex-grow">"StageMateAI helped me list homes 3x faster and saved me over $2,000 last month alone."</p>
                <div className="mt-auto">
                  <p className="font-semibold text-white">Sarah M.</p>
                  <p className="text-gray-400 text-sm">Top Selling Agent</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-white/10">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <svg className="h-8 w-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-lg mb-6 flex-grow">"It's like having a professional stager and photographer in my pocket."</p>
                <div className="mt-auto">
                  <p className="font-semibold text-white">James L.</p>
                  <p className="text-gray-400 text-sm">R1 Agency Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section 5: Pricing Preview */}
      <section className="py-16 bg-black/20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Affordable Plans When You're Ready</h2>
            <p className="text-gray-300 mt-4 max-w-2xl mx-auto">After your free trial, choose a plan that fits you:</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-white/10 transition-transform hover:scale-105">
              <h3 className="text-2xl font-bold text-white mb-2">Starter Plan</h3>
              <div className="text-3xl font-bold text-orange-400 mb-4">$99<span className="text-lg text-gray-400">/month</span></div>
              <p className="text-gray-300 mb-6">5 listings/month</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">AI-powered staging</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Multiple style options</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Email support</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-md border border-orange-500/30 transition-transform hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-2 -translate-y-1">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <div className="text-3xl font-bold text-orange-400 mb-4">$249<span className="text-lg text-gray-400">/month</span></div>
              <p className="text-gray-300 mb-6">Unlimited listings</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Everything in Starter</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Priority processing</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Premium support</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400">No contracts. Cancel anytime.</p>
          </div>
        </div>
      </section>
      
      {/* Section 6: Final CTA */}
      <section className="py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 py-12 px-6 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to See the Magic?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Upload your first messy room photo — and watch StageMateAI transform it in minutes.</p>
            
            <Link href="/auth" className="inline-block rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-xl shadow-lg transition-all transform hover:scale-105 mb-8">
              Try StageMateAI FREE Now
            </Link>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Instant access</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Transform photos in under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BeamsBackground>
  );
}
