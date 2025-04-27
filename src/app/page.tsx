import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Before/After */}
      <section className="relative bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b]/90 to-[#0f172a]/90 z-10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blue-500 filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-cyan-400 filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
              <div className="inline-block px-3 py-1 bg-blue-600/20 rounded-full text-blue-400 text-sm font-medium mb-2">
                AI-Powered Virtual Staging
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">StageMate AI</span>
                <span className="block mt-2">Transform Your Listings</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-xl mx-auto lg:mx-0">
                Instantly turn empty or outdated rooms into beautifully staged spaces with our AI technology. No photographers, no designers, no waiting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/auth" className="rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-8 py-4 text-lg shadow-lg transition-all transform hover:scale-105">
                  Try it now – Free
                </Link>
                <Link href="/dashboard" className="rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 text-lg shadow-lg transition-all border border-white/20">
                  View Examples
                </Link>
              </div>
              <p className="text-sm text-gray-400">No credit card required. Start with 3 free photos.</p>
            </div>
            
            {/* Before/After Showcase */}
            <div className="lg:w-1/2 relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* The "BEFORE" image */}
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    BEFORE
                  </div>
                  <Image 
                    src="/images/before-living-room.jpg" 
                    alt="Before staging" 
                    width={600} 
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* The "AFTER" image (positioned to overlap) */}
                <div className="absolute -bottom-10 -right-10 w-3/4 rounded-lg overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900 transform transition-all hover:scale-105">
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    AFTER
                  </div>
                  <Image 
                    src="/images/after-living-room.jpg" 
                    alt="After AI staging" 
                    width={600} 
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How StageMate AI Works</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">Transform your property photos in three simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload Your Photos</h3>
              <p className="text-gray-600 dark:text-gray-400">Simply upload your property photos to our secure platform.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select Room Type & Style</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose the room type and your preferred design style.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Staged Images</h3>
              <p className="text-gray-600 dark:text-gray-400">Our AI transforms your photos into professionally staged spaces in minutes.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Listings?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of real estate professionals using StageMate AI to sell properties faster.</p>
          <Link href="/auth" className="inline-block rounded-md bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-lg transition-all transform hover:scale-105">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
