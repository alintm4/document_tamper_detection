'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ExtensionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Browser Extension
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Verify Images
              <span className="block text-gray-400">Right From Your Browser</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Install our browser extension to instantly verify any image on the web. 
              Right-click on any image to check its authenticity without leaving the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 3.953A7.5 7.5 0 0112 6a7.5 7.5 0 015.415 2.454l3.953-3.953C19.169 1.757 15.79 0 12 0z"/>
                  <path d="M1.931 5.932A11.943 11.943 0 000 12c0 2.168.576 4.2 1.581 5.955l4.174-4.174A7.46 7.46 0 015.5 12c0-.631.078-1.245.225-1.831L1.931 5.932z"/>
                  <path d="M12 18a7.5 7.5 0 01-5.415-2.454L2.632 19.5A11.95 11.95 0 0012 24c3.79 0 7.169-1.757 9.368-4.501l-3.953-3.953A7.5 7.5 0 0112 18z"/>
                  <path d="M23.5 12a11.8 11.8 0 00-.344-2.849H12v5.698h6.458a7.5 7.5 0 01-2.043 3.605l3.953 3.953A11.95 11.95 0 0023.5 12z"/>
                </svg>
                Add to Chrome
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all border border-gray-200 hover:border-gray-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 0C5.326 0 0 5.326 0 12.001c0 5.991 4.384 10.956 10.113 11.858v-5.66h-2.07c-.588 0-1.122-.247-1.516-.641-.394-.394-.641-.928-.641-1.516V14.82h-.705c-.588 0-1.122-.247-1.516-.641-.394-.394-.641-.928-.641-1.516V10.62c0-1.181.959-2.14 2.14-2.14h5.31c.588 0 1.122.247 1.516.641.394.394.641.928.641 1.516v2.043c0 .588-.247 1.122-.641 1.516-.394.394-.928.641-1.516.641h-.705v1.222c0 .588.247 1.122.641 1.516.394.394.928.641 1.516.641h2.07v5.66C19.616 22.957 24 17.992 24 12.001 24 5.326 18.674 0 12.001 0z"/>
                </svg>
                Add to Firefox
              </a>
            </div>
          </div>

          {/* Screenshot Placeholder */}
          <div className="mb-20">
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Browser mockup header */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-400 max-w-md">
                      example.com
                    </div>
                  </div>
                </div>
                {/* Screenshot area - placeholder */}
                <div className="aspect-video bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Extension screenshot will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Everything you need to verify images while browsing the web
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Right-Click to Analyze</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Simply right-click on any image and select "Verify with Proofly" to instantly check its authenticity.
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Instant Results</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Get verification results in seconds without leaving the page you're browsing.
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Privacy Focused</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Images are analyzed securely. We don't store or share your browsing data.
                </p>
              </div>
            </div>
          </div>

          {/* How to Install */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Easy Installation</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Get started in less than a minute
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Click Install</h3>
                <p className="text-gray-500 text-sm">
                  Click the button above to go to the Chrome Web Store or Firefox Add-ons
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Add Extension</h3>
                <p className="text-gray-500 text-sm">
                  Confirm the installation when prompted by your browser
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">Start Verifying</h3>
                <p className="text-gray-500 text-sm">
                  Right-click any image to verify its authenticity instantly
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to verify images on the go?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Install the Proofly extension and start verifying images with a single click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 3.953A7.5 7.5 0 0112 6a7.5 7.5 0 015.415 2.454l3.953-3.953C19.169 1.757 15.79 0 12 0z"/>
                  <path d="M1.931 5.932A11.943 11.943 0 000 12c0 2.168.576 4.2 1.581 5.955l4.174-4.174A7.46 7.46 0 015.5 12c0-.631.078-1.245.225-1.831L1.931 5.932z"/>
                  <path d="M12 18a7.5 7.5 0 01-5.415-2.454L2.632 19.5A11.95 11.95 0 0012 24c3.79 0 7.169-1.757 9.368-4.501l-3.953-3.953A7.5 7.5 0 0112 18z"/>
                  <path d="M23.5 12a11.8 11.8 0 00-.344-2.849H12v5.698h6.458a7.5 7.5 0 01-2.043 3.605l3.953 3.953A11.95 11.95 0 0023.5 12z"/>
                </svg>
                Get for Chrome
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/20"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 0C5.326 0 0 5.326 0 12.001c0 5.991 4.384 10.956 10.113 11.858v-5.66h-2.07c-.588 0-1.122-.247-1.516-.641-.394-.394-.641-.928-.641-1.516V14.82h-.705c-.588 0-1.122-.247-1.516-.641-.394-.394-.641-.928-.641-1.516V10.62c0-1.181.959-2.14 2.14-2.14h5.31c.588 0 1.122.247 1.516.641.394.394.641.928.641 1.516v2.043c0 .588-.247 1.122-.641 1.516-.394.394-.928.641-1.516.641h-.705v1.222c0 .588.247 1.122.641 1.516.394.394.928.641 1.516.641h2.07v5.66C19.616 22.957 24 17.992 24 12.001 24 5.326 18.674 0 12.001 0z"/>
                </svg>
                Get for Firefox
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
