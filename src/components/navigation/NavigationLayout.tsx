import React, { useState, useEffect } from 'react';
import { MainNavigation } from './MainNavigation';
import { AuthNavigation } from './AuthNavigation';
import { AdminNavigation } from './AdminNavigation';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { Button } from '../ui/button';
import { ArrowUp } from 'lucide-react';
import Link from 'next/link';

interface NavigationLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    unreadNotifications?: number;
  };
  onLogout: () => void;
  breadcrumbItems?: Array<{ label: string; href: string }>;
}

export const NavigationLayout: React.FC<NavigationLayoutProps> = ({
  children,
  isAuthenticated,
  isAdmin,
  user,
  onLogout,
  breadcrumbItems,
}) => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide scroll to top button
      setShowScrollToTop(currentScrollY > 400);

      // Show/hide header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHeaderVisible(false); // Scrolling down
      } else {
        setIsHeaderVisible(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
      <header 
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container flex h-14 items-center">
          <MainNavigation />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <AuthNavigation
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
        {isAdmin && (
          <div className="border-t border-b bg-muted">
            <div className="container">
              <AdminNavigation />
            </div>
          </div>
        )}
        <div className="container py-2">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>
      </header>

      <main className="container flex-1 py-6">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with care by the VibeWell team.{' '}
              <Link href={{ pathname: '/terms' }} className="font-medium underline underline-offset-4">
                Terms
              </Link>
              .{' '}
              <Link href={{ pathname: '/privacy' }} className="font-medium underline underline-offset-4">
                Privacy
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <Button
        variant="secondary"
        size="icon"
        className={`fixed bottom-4 right-4 z-50 rounded-full shadow-lg transition-opacity duration-300 ${
          showScrollToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={scrollToTop}
      >
        <ArrowUp className="h-4 w-4" />
        <span className="sr-only">Scroll to top</span>
      </Button>
    </div>
  );
}; 