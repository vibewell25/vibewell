import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routes, createTypedLink } from '@/lib/routes';

const WellnessLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      ...createTypedLink(routes.wellness.root),
      icon: '📊',
    },
    {
      name: 'AR Experience',
      ...createTypedLink(routes.wellness.ar),
      icon: '🎯',
    },
    {
      name: 'Workouts',
      ...createTypedLink(routes.wellness.workouts),
      icon: '💪',
    },
    {
      name: 'Meditation',
      ...createTypedLink(routes.wellness.meditation),
      icon: '🧘',
    },
    {
      name: 'Progress',
      ...createTypedLink(routes.wellness.progress),
      icon: '📈',
    },
    {
      name: 'Community',
      ...createTypedLink(routes.wellness.community),
      icon: '👥',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link {...createTypedLink(routes.wellness.root)} className="flex items-center">
                <span className="text-2xl mr-2">🌿</span>
                <span className="font-semibold text-xl">Vibewell</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  {...item}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map(item => (
            <Link
              key={item.name}
              {...item}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.href ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-600 text-sm">© 2024 Vibewell. All rights reserved.</div>
            <div className="flex space-x-6">
              <Link
                {...createTypedLink(routes.legal.privacy)}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                {...createTypedLink(routes.legal.terms)}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                {...createTypedLink(routes.legal.contact)}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WellnessLayout;
