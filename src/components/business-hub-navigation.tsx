'use client';

import { Icons } from '@/components/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
interface NavigationItem {
  name: string;
  href: string;
  icon: React?.ReactNode;
  description: string;
}
const navigationItems: NavigationItem[] = [
  {
    name: 'Overview',
    href: '/business-hub',
    icon: <Icons?.BuildingStorefrontIcon className="h-6 w-6" />,
    description: 'Business hub home',
  },
  {
    name: 'Marketing',
    href: '/business-hub/marketing',
    icon: <Icons?.MegaphoneIcon className="h-6 w-6" />,
    description: 'Marketing resources and tools',
  },
  {
    name: 'Client Acquisition',
    href: '/business-hub/client-acquisition',
    icon: <Icons?.UserGroupIcon className="h-6 w-6" />,
    description: 'Strategies to attract new clients',
  },
  {
    name: 'Financial Management',
    href: '/business-hub/financial-management',
    icon: <Icons?.CurrencyDollarIcon className="h-6 w-6" />,
    description: 'Financial tools and resources',
  },
  {
    name: 'Analytics',
    href: '/business-hub/analytics',
    icon: <Icons?.ChartBarIcon className="h-6 w-6" />,
    description: 'Track and analyze your business performance',
  },
  {
    name: 'Resources',
    href: '/business-hub/resources',
    icon: <Icons?.DocumentTextIcon className="h-6 w-6" />,
    description: 'Guides, templates and more',
  },
  {
    name: 'Learning Center',
    href: '/business-hub/learning',
    icon: <Icons?.AcademicCapIcon className="h-6 w-6" />,
    description: 'Business education and courses',
  },
  {
    name: 'Bookmarks',
    href: '/business-hub/bookmarks',
    icon: <Icons?.BookmarkIcon className="h-6 w-6" />,
    description: 'Your saved resources and recent activity',
  },
];
export function BusinessHubNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  // Effect to track window size
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window?.innerWidth);
    // Function to update window width
    function handleResize() {
      setWindowWidth(window?.innerWidth);
    }
    // Add event listener
    window?.addEventListener('resize', handleResize);
    // Clean up
    return () => window?.removeEventListener('resize', handleResize);
  }, []);
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/business-hub' && pathname === '/business-hub') {
      return true;
    }
    if (path !== '/business-hub' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };
  // Find the currently active item
  const activeItem = navigationItems?.find((item) => isActive(item?.href));
  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  // Determine if we should show mobile or desktop navigation
  const isMobile = windowWidth < 768; // 768px is typical md breakpoint
  return (
    <nav className="mb-8 overflow-hidden rounded-lg bg-white shadow">
      {/* Mobile Navigation */}
      {isMobile && (
        <div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {activeItem && (
                <>
                  <span className="mr-2">{activeItem?.icon}</span>
                  <span className="font-medium">{activeItem?.name}</span>
                </>
              )}
            </div>
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 hover:bg-gray-100"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <Icons?.XMarkIcon className="h-6 w-6" />
              ) : (
                <Icons?.Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="space-y-1 border-t border-gray-200 px-4 py-2">
              {navigationItems?.map((item) => {
                const active = isActive(item?.href);
                return (
                  <Link
                    key={item?.name}
                    href={item?.href}
                    className={`flex items-center rounded-md px-3 py-3 ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item?.icon}</span>
                    <span>{item?.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Desktop Navigation */}
      {!isMobile && (
        <div className="flex flex-wrap items-center gap-1 p-1">
          {navigationItems?.map((item) => {
            const active = isActive(item?.href);
            return (
              <Link
                key={item?.name}
                href={item?.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={item?.description}
              >
                <span className="mr-2">{item?.icon}</span>
                <span>{item?.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
