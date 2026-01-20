'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Navbar({ isLoggedIn = false, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="navShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#3b82f6'}}/>
                    <stop offset="100%" style={{stopColor:'#1d4ed8'}}/>
                  </linearGradient>
                </defs>
                <path d="M50 5 L90 20 L90 45 C90 70 70 88 50 98 C30 88 10 70 10 45 L10 20 Z" fill="url(#navShieldGrad)"/>
                <ellipse cx="50" cy="42" rx="18" ry="11" fill="none" stroke="#fff" strokeWidth="3"/>
                <circle cx="50" cy="42" r="6" fill="#fff"/>
                <circle cx="50" cy="42" r="3" fill="#1d4ed8"/>
                <path d="M38 68 L46 76 L64 58" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Proofly</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-gray-900 bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/analyze" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/analyze') 
                  ? 'text-gray-900 bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Analyze
            </Link>
            <Link 
              href="/extension" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/extension') 
                  ? 'text-gray-900 bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Extension
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-gray-900 bg-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-1">
              <Link 
                href="/" 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/analyze" 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/analyze') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Analyze
              </Link>
              <Link 
                href="/extension" 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/extension') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Extension
              </Link>
              <Link 
                href="/about" 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                About
              </Link>
              <div className="pt-3 mt-3 border-t border-gray-100">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
                      Dashboard
                    </Link>
                    <button onClick={onLogout} className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">
                      Login
                    </Link>
                    <Link href="/signup" className="block px-4 py-3 mt-2 bg-gray-900 text-white text-center rounded-xl text-sm font-medium">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
