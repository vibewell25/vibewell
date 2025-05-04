import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
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

export const MainNavigation: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasNotch, setHasNotch] = useState(false);

  // Check for mobile device and notch (safe area) on component mount
  useEffect(() => {
    // Check if mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check if device has a notch or safe area
    const checkSafeArea = () => {
      // iOS detection
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      // iPhone X or newer detection (rough approximation)
      const iphoneWithNotch = iOS && 
        window.screen.height >= 812 && 
        window.devicePixelRatio >= 2;
      
      // Android detection for cutouts
      const androidWithCutout = /Android/.test(navigator.userAgent) && 
        (window as any).screen.orientation && 
        window.innerHeight > window.innerWidth;
      
      setHasNotch(iphoneWithNotch || androidWithCutout);
    };

    checkMobile();
    checkSafeArea();

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
    <nav className={`fixed w-full z-50 bg-white border-b border-gray-200 shadow-sm ${hasNotch ? 'pt-safe-top' : ''}`}>
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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className={`p-0 w-[75vw] ${hasNotch ? 'pt-safe-top pb-safe-bottom' : ''}`}>
                <div className="flex flex-col h-full">
                  <div className="px-4 pt-5 pb-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl font-semibold text-blue-600">VibeWell</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                        className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-6 overflow-y-auto">
                    <div className="flex flex-col space-y-1">
                      {filteredNavItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center px-3 py-4 text-base font-medium rounded-md ${
                            pathname === item.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <span className="mr-4 h-6 w-6">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bottom Tabs */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 ${hasNotch ? 'pb-safe-bottom' : ''}`}>
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
