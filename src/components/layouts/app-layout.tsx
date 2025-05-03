import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSession } from '@/lib/auth0';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      const session = await getSession();
      if (!session?.user) {
        router?.push('https://app?.getvibewell.com/login');
      }
    };
    checkAuth();
  }, [router]);

  const navigationItems = [
    { href: '/app', label: 'Home', icon: '🏠' },
    { href: '/app/appointments', label: 'Appointments', icon: '📅' },
    { href: '/app/services', label: 'Services', icon: '💅' },
    { href: '/app/messages', label: 'Messages', icon: '💬' },
    { href: '/app/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/app" className="text-2xl font-bold text-gray-800">
                <span>Vibe<span className="text-pink-500">Well</span></span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/app/notifications" className="text-gray-600 hover:text-gray-900">
                🔔
              </Link>
              <button
                onClick={() => router?.push('https://app?.getvibewell.com/api/auth/logout')}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.href}
              href={item?.href}
              className={`flex flex-col items-center justify-center py-2 ${
                router?.pathname === item?.href
                  ? 'text-pink-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item?.icon}</span>
              <span className="text-xs mt-1">{item?.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden sm:flex">
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    router?.pathname === item?.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item?.icon}</span>
                  {item?.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="sm:hidden pb-16">
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 