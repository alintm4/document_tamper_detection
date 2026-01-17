import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">Proofly</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/analyze" className="text-gray-500 hover:text-gray-900 text-sm">
              Analyze
            </Link>
            <Link href="/about" className="text-gray-500 hover:text-gray-900 text-sm">
              About
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 text-sm">
              Privacy
            </Link>
          </div>

          <p className="text-gray-400 text-sm">
            © 2026 Proofly
          </p>
        </div>
      </div>
    </footer>
  );
}
