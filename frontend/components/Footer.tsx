import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="footerShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#3b82f6'}}/>
                      <stop offset="100%" style={{stopColor:'#1d4ed8'}}/>
                    </linearGradient>
                  </defs>
                  <path d="M50 5 L90 20 L90 45 C90 70 70 88 50 98 C30 88 10 70 10 45 L10 20 Z" fill="url(#footerShieldGrad)"/>
                  <ellipse cx="50" cy="42" rx="18" ry="11" fill="none" stroke="#fff" strokeWidth="3"/>
                  <circle cx="50" cy="42" r="6" fill="#fff"/>
                  <circle cx="50" cy="42" r="3" fill="#1d4ed8"/>
                  <path d="M38 68 L46 76 L64 58" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Proofly</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              AI-powered image authenticity verification. Detect manipulated screenshots and documents instantly.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/analyze" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Analyze Image
                </Link>
              </li>
              <li>
                <Link href="/extension" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Browser Extension
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 Proofly. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
