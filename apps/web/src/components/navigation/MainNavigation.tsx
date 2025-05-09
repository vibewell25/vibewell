'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Activity, Calendar, Users, FileText, User, X, Rss } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
  { label: 'Balanced Experience', href: '/services', icon: <Activity className="h-4 w-4" /> },
  { label: 'Social', href: '/social', icon: <Rss className="h-4 w-4" /> },
  { label: 'Bookings', href: '/bookings', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Community', href: '/community', icon: <Users className="h-4 w-4" /> },
  { label: 'Events', href: '/events', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Resources', href: '/resources', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', href: '/profile', icon: <User className="h-4 w-4" />, requiresAuth: true },
];

const MainNavigation: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device on component mount
  useEffect(() => {
    // Check if mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();

    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter items based on auth requirement if needed
  const isAuthenticated = true; // Replace with actual auth check
  const filteredNavItems = navigationItems.filter(
    item => !item.requiresAuth || (item.requiresAuth && isAuthenticated)
  );
  
  return (
    <nav className="fixed w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-blue-600">VibeWell</span>
            </Link>
            
            {/* Desktop Navigation Items */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-label="Open navigation menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Tabs - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {filteredNavItems.slice(0, 5).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs ${
                pathname === item.href 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={`h-6 w-6 mb-1 ${pathname === item.href ? 'text-blue-600' : ''}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
