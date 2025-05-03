import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routes, createTypedLink } from '@/lib/routes';

const WellnessLayout = ({ children }: { children: React?.ReactNode }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      ...createTypedLink(routes?.wellness.root),
      icon: '📊',
    },
    {
      name: 'AR Experience',
      ...createTypedLink(routes?.wellness.ar),
      icon: '🎯',
    },
    {
      name: 'Workouts',
      ...createTypedLink(routes?.wellness.workouts),
      icon: '💪',
    },
    {
      name: 'Meditation',
      ...createTypedLink(routes?.wellness.meditation),
      icon: '🧘',
    },
    {
      name: 'Progress',
      ...createTypedLink(routes?.wellness.progress),
      icon: '📈',
    },
    {
      name: 'Community',
      ...createTypedLink(routes?.wellness.community),
      icon: '👥',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link {...createTypedLink(routes?.wellness.root)} className="flex items-center">
                <span className="mr-2 text-2xl">🌿</span>
                <span className="text-xl font-semibold">Vibewell</span>
              </Link>
            </div>

            <div className="hidden items-center space-x-4 md:flex">
              {navigation?.map((item) => (
                <Link
                  key={item?.name}
                  {...item}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item?.href
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item?.icon}</span>
                  {item?.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="rounded-md p-2 text-gray-600 hover:bg-gray-100">
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
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation?.map((item) => (
            <Link
              key={item?.name}
              {...item}
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                pathname === item?.href ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item?.icon}</span>
              {item?.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">© 2024 Vibewell. All rights reserved.</div>
            <div className="flex space-x-6">
              <Link
                {...createTypedLink(routes?.legal.privacy)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                {...createTypedLink(routes?.legal.terms)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Terms of Service
              </Link>
              <Link
                {...createTypedLink(routes?.legal.contact)}
                className="text-sm text-gray-600 hover:text-gray-900"
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
