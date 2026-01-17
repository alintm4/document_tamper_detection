'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-36 pb-24 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              AI-Powered Detection
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Verify Image
              <span className="block text-gray-400">Authenticity</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Detect manipulated screenshots and documents with advanced AI analysis. 
              Protect yourself from digital forgery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/analyze"
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Start Analyzing
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all border border-gray-200 hover:border-gray-300"
              >
                How It Works
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How it works
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Three simple steps to verify any image
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow transition-shadow">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Step 1</div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Upload Image</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Drag and drop your image or click to browse. We support PNG, JPG, and WebP formats.</p>
              </div>
              <div className="relative p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow transition-shadow">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Step 2</div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">AI Analysis</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Our machine learning model analyzes pixel patterns and metadata for signs of manipulation.</p>
              </div>
              <div className="relative p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow transition-shadow">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Step 3</div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Get Results</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Receive a detailed authenticity report with confidence scores and analysis breakdown.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-gray-900">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">99%</div>
                <div className="text-gray-400 text-sm">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">&lt;2s</div>
                <div className="text-gray-400 text-sm">Analysis Time</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">50K+</div>
                <div className="text-gray-400 text-sm">Images Analyzed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">Free</div>
                <div className="text-gray-400 text-sm">To Get Started</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to verify your images?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Join thousands of users who trust Proofly for image authentication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Create Free Account
              </Link>
              <Link
                href="/analyze"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all border border-gray-200 hover:border-gray-300"
              >
                Try Without Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
