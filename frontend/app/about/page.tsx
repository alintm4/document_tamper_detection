import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              About Proofly
            </h1>
            <p className="text-gray-600">
              Helping you verify image authenticity in a world of digital manipulation.
            </p>
          </div>

          
          <div className="mb-10">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                As AI-generated images become more common, verifying authenticity matters more than ever. Proofly provides a simple way to check if images have been manipulated.
              </p>
            </div>
          </div>

         
          <div className="mb-10">
            <h2 className="text-lg font-medium text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium text-sm">Upload Image</h3>
                  <p className="text-gray-500 text-sm">Drop any image file - PNG, JPG, or WebP.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium text-sm">Analysis</h3>
                  <p className="text-gray-500 text-sm">Our system checks for signs of manipulation.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium text-sm">Get Results</h3>
                  <p className="text-gray-500 text-sm">See if the image is authentic or potentially altered.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="mb-10">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Technology</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900 font-medium text-sm mb-1">Pattern Analysis</h3>
                <p className="text-gray-500 text-xs">
                  Detects subtle patterns left by image editing tools.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900 font-medium text-sm mb-1">Metadata Check</h3>
                <p className="text-gray-500 text-xs">
                  Examines file properties for inconsistencies.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900 font-medium text-sm mb-1">Artifact Detection</h3>
                <p className="text-gray-500 text-xs">
                  Identifies artifacts from AI generation.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-gray-900 font-medium text-sm mb-1">Continuous Updates</h3>
                <p className="text-gray-500 text-xs">
                  Regularly improved to detect new techniques.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-4">Ready to verify an image?</p>
            <Link
              href="/analyze"
              className="inline-block px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try It Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
