'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
              Verify Image Authenticity
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto mb-10">
              Check if screenshots and documents are real or digitally manipulated.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/analyze"
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
              >
                Analyze Image
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-700 font-medium">1</span>
                </div>
                <h3 className="text-gray-900 font-medium mb-2">Upload</h3>
                <p className="text-gray-500 text-sm">Drop your image or click to upload</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-700 font-medium">2</span>
                </div>
                <h3 className="text-gray-900 font-medium mb-2">Analyze</h3>
                <p className="text-gray-500 text-sm">Our system checks for manipulation</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-700 font-medium">3</span>
                </div>
                <h3 className="text-gray-900 font-medium mb-2">Results</h3>
                <p className="text-gray-500 text-sm">Get instant verification results</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 border-t border-gray-100">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to verify?
            </h2>
            <p className="text-gray-600 mb-6">
              Start checking images for free.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
