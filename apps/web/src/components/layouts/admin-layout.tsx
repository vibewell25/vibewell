import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSession } from '@/lib/auth0';
import SecurityNotifications from '@/components/SecurityNotifications';

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        const session = await getSession();
        if (!session.user) {
          router.push('https://app.getvibewell.com/login');
          return;
        }
        if (!session.user.isAdmin) {
          router.push('https://app.getvibewell.com/unauthorized');
          return;
        }

        // Set user data
        setUser({
          name: session.user.name || 'Admin User',
          email: session.user.email || '',
          role: 'Administrator',
          lastActive: new Date().toISOString(),
        });

        // Log admin activity
        await fetch('/api/admin/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'page_view',
            path: router.pathname,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Session validation error:', error);
        router.push('https://app.getvibewell.com/login');
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, [router]);

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/services', label: 'Services', icon: '💅' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/admin/security', label: 'Security', icon: '🔒' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const handleLogout = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      // Log the logout activity
      await fetch('/api/admin/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
          timestamp: new Date().toISOString(),
        }),
      });
      router.push('https://app.getvibewell.com/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('https://app.getvibewell.com/api/auth/logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/admin" className="text-2xl font-bold text-gray-800">
                <span>Vibe<span className="text-pink-500">Well</span> Admin</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <SecurityNotifications />
              {user && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.name}</span>
                  <span className="mx-2">•</span>
                  <span>{user.role}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <span className="mr-2">Logout</span>
                <span>🚪</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    router.pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
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
    </div>
  );
} 