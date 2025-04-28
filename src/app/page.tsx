import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Navigation */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">🏠 StageMate</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link href="#features" className="text-gray-700 hover:text-purple-600 font-medium">Features</Link>
            <Link href="#pricing" className="text-gray-700 hover:text-purple-600 font-medium">Pricing</Link>
            <Link href="#contact" className="text-gray-700 hover:text-purple-600 font-medium">Contact Us</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-gray-700 hover:text-purple-600 font-medium">Log In</Link>
            <Link href="/auth" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors">Sign Up</Link>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="w-full pt-16 pb-8 md:pt-24 md:pb-12 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm border border-purple-200 bg-purple-50 text-purple-700">
                <span>AI-Powered Virtual Staging</span>
                <a href="/auth" className="flex items-center gap-1 ml-2 text-purple-600 font-medium">
                  Try it free
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight max-w-5xl w-[120%] mx-auto">
                Instantly Turn Messy Homes<br />into Market-Ready Listings
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                Upload a photo. Watch AI clean, stage, and enhance it — in seconds. No photographers. No staging fees.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <a href="/auth" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors shadow-md">
                  TRY FOR FREE
                </a>
              </div>
              
              {/* Before/After Showcase */}
              <div className="w-full mt-12">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                  {/* The "BEFORE" image */}
                  <div className="flex justify-center items-center w-full md:w-2/5">
                    <div className="relative rounded-xl overflow-hidden shadow-md border border-gray-100" style={{ width: '480px', maxWidth: '100%' }}>
                      <div className="absolute top-4 left-4 bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
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
                    <div className="hidden md:flex md:items-center md:justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div className="flex md:hidden items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* The "AFTER" image */}
                  <div className="flex justify-center items-center w-full md:w-3/5">
                    <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-100" style={{ width: '650px', maxWidth: '100%' }}>
                      <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
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
      <section className="py-16 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How StageMateAI Works</h2>
            <p className="text-gray-600 mt-4">Simple three-step process to transform your listings</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Snap a Photo</h3>
              <p className="text-gray-600">Upload any room — even messy ones — from your phone or camera.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Cleans and Stages</h3>
              <p className="text-gray-600">Our AI removes clutter, enhances lighting, and adds tasteful virtual decor.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Download and List</h3>
              <p className="text-gray-600">Download ready-to-go, real-estate perfect images.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/auth" className="inline-block rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 shadow-md transition-all">
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
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">List Properties Faster</h3>
                <p className="text-gray-600">No waiting for photographers — get listings online immediately.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Thousands</h3>
                <p className="text-gray-600">Eliminate photography and staging fees completely.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">Upload from your phone in minutes, no technical skills needed.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Always On</h3>
                <p className="text-gray-600">Works 24/7, whenever you need it, no scheduling required.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
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
            <Link href="/auth" className="inline-block rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 shadow-md transition-all">
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
                  <svg className="h-8 w-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
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
                  <svg className="h-8 w-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
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
      
      {/* Section 5: Pricing Preview */}
      <section className="py-16 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, Flexible Pricing</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">After your free trial, choose a plan that fits your needs</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 inline-flex shadow-sm border border-gray-200">
              <button className="px-4 py-2 rounded-full bg-purple-600 text-white font-medium">Monthly</button>
              <button className="px-4 py-2 rounded-full text-gray-700 font-medium">Yearly</button>
            </div>
            <div className="ml-2 inline-flex items-center">
              <span className="text-sm font-medium text-purple-600">Save 30% OFF</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-transform hover:shadow-md hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Plan</h3>
              <div className="text-3xl font-bold text-purple-600 mb-4">$99<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-6">5 listings/month</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">AI-powered staging</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Multiple style options</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-white border border-gray-300 hover:border-purple-600 text-gray-900 font-medium rounded-md transition-colors">
                Get Started
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-purple-200 transition-transform hover:shadow-lg hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-2 -translate-y-1">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h3>
              <div className="text-3xl font-bold text-purple-600 mb-4">$249<span className="text-lg text-gray-500">/month</span></div>
              <p className="text-gray-600 mb-6">Unlimited listings</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Everything in Starter</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Priority processing</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Premium support</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors shadow-md">
                Contact Sales
              </button>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-500">No contracts. Cancel anytime.</p>
          </div>
        </div>
      </section>
      
      {/* Section 6: Final CTA */}
      <section className="py-20 bg-white" id="contact">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 py-12 px-6 shadow-md">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to See the Magic?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Upload your first messy room photo — and watch StageMateAI transform it in minutes.</p>
            
            <Link href="/auth" className="inline-block rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 text-xl shadow-md transition-all transform hover:scale-105 mb-8">
              Try StageMateAI FREE Now
            </Link>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Instant access</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Transform photos in under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Common questions & answers</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Do I have to pay for each agent account?</h3>
              <p className="text-gray-600">Yes, we charge a fee for every agent account created, regardless of whether the agent is logged in or not. It is a long established fact that a reader is distracted by the readable content page when looking.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Do you provide customer service agents?</h3>
              <p className="text-gray-600">It is a long established fact that a reader is distracted by the readable content page when looking at its layout. The point of using Lorem Ipsum. No, we provide the tools for your agents.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-bold text-gray-900">🏠 StageMate</h1>
              <p className="text-gray-600 text-sm mt-1">AI-powered virtual staging for real estate</p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-purple-600">Terms</Link>
              <Link href="#" className="text-gray-600 hover:text-purple-600">Privacy</Link>
              <Link href="#" className="text-gray-600 hover:text-purple-600">Contact</Link>
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
