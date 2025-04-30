import Link from 'next/link';
import type { ReactNode } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            <span>Vibe<span className="text-pink-500">Well</span></span>
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link
              href="https://app.getvibewell.com"
              className="text-pink-500 hover:text-pink-600"
            >
              Launch App
            </Link>
          </div>
        </nav>
      </header>

      {children}

      <footer className="mt-auto bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">VibeWell</h3>
              <p className="text-gray-600">
                Elevating your beauty and wellness experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="https://app.getvibewell.com" className="text-gray-600 hover:text-gray-900">
                    Launch App
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact</h3>
              <p className="text-gray-600">
                Questions? Reach out to us at{' '}
                <a href="mailto:hello@getvibewell.com" className="text-pink-500 hover:text-pink-600">
                  hello@getvibewell.com
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} VibeWell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 