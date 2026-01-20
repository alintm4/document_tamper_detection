import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About Proofly
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Helping you verify image authenticity in a world of digital manipulation and AI-generated content.
            </p>
          </div>

          {/* Mission Card */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Our Mission</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                As AI-generated images become increasingly sophisticated, the ability to verify authenticity matters more than ever. 
                Proofly provides a simple, powerful way to check if images have been manipulated, helping individuals and organizations 
                maintain trust in visual content.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h2>
              <p className="text-gray-500">Three simple steps to verify any image</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-5">
                  <span className="text-gray-900 font-bold text-lg">1</span>
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Upload Image</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Drop any image file into our analyzer. We support PNG, JPG, and WebP formats up to 10MB.
                </p>
              </div>
              <div className="relative bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-5">
                  <span className="text-gray-900 font-bold text-lg">2</span>
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">AI Analysis</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our machine learning model examines the image for signs of manipulation or AI generation.
                </p>
              </div>
              <div className="relative bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-5">
                  <span className="text-gray-900 font-bold text-lg">3</span>
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Get Results</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Receive a detailed report showing if the image is authentic or potentially altered.
                </p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Technology</h2>
              <p className="text-gray-500">Advanced detection powered by machine learning</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Pattern Analysis</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Detects subtle patterns and inconsistencies left by image editing tools and AI generators.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Metadata Check</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Examines EXIF data and file properties for inconsistencies that indicate tampering.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Artifact Detection</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Identifies visual artifacts and anomalies commonly found in AI-generated images.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Continuous Updates</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our model is regularly updated to detect the latest manipulation techniques and AI tools.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to verify an image?</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start analyzing images for free. No account required for basic verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/analyze"
                className="px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Start Analyzing
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-all border border-gray-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
