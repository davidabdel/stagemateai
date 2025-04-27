import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "../components/hero-section";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section with Animated Text */}
      <section className="relative bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b]/90 to-[#0f172a]/90 z-10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blue-500 filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-cyan-400 filter blur-3xl"></div>
        </div>
        
        <div className="relative z-20">
          <HeroSection />
        </div>
        
        {/* Before/After Showcase */}
        <div className="container mx-auto px-4 pb-16 md:pb-24 relative z-20">
          <h2 className="text-2xl font-bold text-center text-white mb-8">See the Transformation</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* The "BEFORE" image */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl w-full md:w-2/5">
              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                BEFORE
              </div>
              <Image 
                src="https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1000" 
                alt="Before staging - Room with exercise equipment" 
                width={500} 
                height={350}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Arrow pointing from before to after */}
            <div className="flex items-center justify-center py-4 md:py-0">
              <div className="hidden md:block w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="block md:hidden w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            
            {/* The "AFTER" image */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl w-full md:w-2/5">
              <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                AFTER
              </div>
              <Image 
                src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000" 
                alt="After AI staging - Elegantly furnished living room" 
                width={500} 
                height={350}
                className="w-full h-auto object-cover"
              />
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
    </main>
  );
}
