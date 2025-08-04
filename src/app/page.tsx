"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "../components/Logo";
import BeforeAfterSlider from "../components/BeforeAfterSlider";

export default function Home() {
  return (
      <div className="min-h-screen">
      {/* Navigation */}
      <header className="bg-white py-4 sticky top-0 z-50">
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
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-blue-800 text-sm font-medium">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-800 text-sm font-medium">Pricing</Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-800 text-sm font-medium">About</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-gray-700 hover:text-blue-800 text-sm font-medium">Sign In</Link>
            <Link href="/try" className="bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400 hover:from-blue-900 hover:via-gray-700 hover:to-amber-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm">Get Started</Link>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="w-full pt-12 pb-16 md:pt-16 md:pb-20 px-4 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              {/* Centered header content */}
              <div className="flex flex-col items-center text-center max-w-3xl gap-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400">
                    Transform Empty Rooms
                  </span>
                  <span className="block font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400">
                    Into Buyer Dreams
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 max-w-2xl">
                  AI-powered digital staging that helps real estate agents sell properties faster and for higher value. Upload a photo, get stunning staged results in seconds.
                </p>
                
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  <a href="/try" className="px-6 py-3 text-white font-bold rounded-md transition-all shadow-md bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400 hover:from-blue-900 hover:via-gray-700 hover:to-amber-500 flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Your First Photo
                  </a>
                  <a href="#demo" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-md transition-colors shadow-sm hover:bg-gray-50">
                    Watch Demo
                  </a>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">AI-based insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">24/7 turnaround time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Professional quality</span>
                  </div>
                </div>
              </div>
              
              {/* Removed the slider as per the new design */}
            </div>
          </div>
        </section>
      
      </main>
      
      {/* See the Transformation Section */}
      <section className="pt-8 pb-16 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">See the Transformation</h2>
            <p className="text-gray-600 mt-2">Real photos, real results, no professional staging</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Before */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative">
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">BEFORE</div>
                <img 
                  src="/images/Before_1.png" 
                  alt="Empty living room" 
                  className="w-full h-auto"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Empty Living Room</h3>
                <p className="text-gray-600 text-sm">Not the easiest to visualize potential</p>
              </div>
            </div>
            
            {/* After */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative">
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">AFTER</div>
                <img 
                  src="/images/After_2.png" 
                  alt="Professionally staged living room" 
                  className="w-full h-auto"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">Professionally Staged</h3>
                <p className="text-gray-600 text-sm">Buyers can imagine their future home</p>
              </div>
            </div>
          </div>
          
          <div 
            className="mt-16 border-2 border-dashed border-blue-200 rounded-lg p-8 max-w-4xl mx-auto text-center"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('border-blue-500');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('border-blue-500');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('border-blue-500');
              window.location.href = '/try';
            }}
          >
            <div className="mb-6">
              <svg className="h-16 w-16 text-blue-700 mx-auto" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4">Try It Now</h3>
            <p className="text-gray-600 mb-6">Drag and drop your room photo or click to upload</p>
            <a href="/try" className="inline-block bg-gradient-to-r from-blue-800 via-gray-600 to-amber-400 hover:from-blue-900 hover:via-gray-700 hover:to-amber-500 text-white font-bold px-8 py-3 rounded-md transition-all shadow-md">
              Choose Photo
            </a>
            <p className="text-xs text-gray-500 mt-4">Supports JPG, PNG up to 10MB • Free trial available</p>
          </div>
        </div>
      </section>
      
      {/* Transform Your Real Estate Business Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-700 font-medium mb-2">Why Choose StageMate AI</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Transform Your Real Estate Business</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Give your clients the advantage they deserve with AI-powered staging that sells homes faster and for more money.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="mb-5 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-amber-500 font-bold text-xl mb-1">Up to 20% more</h3>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Higher Sale Prices</h4>
              <p className="text-gray-600 text-sm">Staged properties sell for 6-20% more than empty ones</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="mb-5 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-amber-500 font-bold text-xl mb-1">73% faster</h3>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Faster Sales</h4>
              <p className="text-gray-600 text-sm">Reduce time on market from months to weeks</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="mb-5 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-amber-500 font-bold text-xl mb-1">Premium service</h3>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Competitive Edge</h4>
              <p className="text-gray-600 text-sm">Stand out from other agents with cutting-edge technology</p>
            </div>
            
            {/* Card 4 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="mb-5 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-amber-500 font-bold text-xl mb-1">2x more clients</h3>
              <h4 className="text-lg font-bold text-gray-900 mb-2">More Listings</h4>
              <p className="text-gray-600 text-sm">Attract sellers who want the best marketing for their home</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits for Real Estate Agents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Benefits for Real Estate Agents</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <svg className="h-12 w-12 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Higher Sale Prices</h3>
              <p className="text-gray-600 text-sm">Staged properties consistently sell for more than empty rooms</p>
            </div>
            
            {/* Benefit 2 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <svg className="h-12 w-12 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" />
                  <path d="M10 4a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V5a1 1 0 011-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Faster Sales</h3>
              <p className="text-gray-600 text-sm">Reduce days on market by helping buyers visualize living in the space</p>
            </div>
            
            {/* Benefit 3 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <svg className="h-12 w-12 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Edge</h3>
              <p className="text-gray-600 text-sm">Stand out from other agents by offering premium marketing materials</p>
            </div>
            
            {/* Benefit 4 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <svg className="h-12 w-12 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 014.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More Listings</h3>
              <p className="text-gray-600 text-sm">Impress clients and win more listings for your real estate business</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* What Your Clients Get Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Your Clients Get</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emotional Connection</h3>
              <p className="text-gray-600 text-sm">Help buyers fall in love with the potential of their future home</p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Visualization</h3>
              <p className="text-gray-600 text-sm">No need to imagine - we make it easy to see how spaces can look</p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-gray-600 text-sm">Our AI creates designs that look like they cost thousands</p>
            </div>
            
            {/* Feature 4 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Effective</h3>
              <p className="text-gray-600 text-sm">All the benefits of traditional staging at a fraction of the cost</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ready to Get Started Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">Join hundreds of agents already using StageMate AI to transform their business</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">How trial available</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Professional results</span>
              </div>
            </div>
            
            <Link href="/try" className="inline-block rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-4 text-xl shadow-md transition-all">
              Try StageMate AI Free
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <img 
                src="/images/3.png" 
                alt="StageMate Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-gray-600 hover:text-blue-700 text-sm">Features</Link></li>
                  <li><Link href="/pricing" className="text-gray-600 hover:text-blue-700 text-sm">Pricing</Link></li>
                  <li><Link href="/try" className="text-gray-600 hover:text-blue-700 text-sm">Try Free</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-600 hover:text-blue-700 text-sm">About</Link></li>
                  <li><Link href="/blog" className="text-gray-600 hover:text-blue-700 text-sm">Blog</Link></li>
                  <li><Link href="/contact" className="text-gray-600 hover:text-blue-700 text-sm">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-gray-600 hover:text-blue-700 text-sm">Terms</Link></li>
                  <li><Link href="/privacy" className="text-gray-600 hover:text-blue-700 text-sm">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} StageMate AI. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-blue-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
