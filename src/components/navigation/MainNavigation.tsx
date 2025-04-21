import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, X, Home, Activity, Calendar, Users, Book, FileText, User } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
  { label: 'Wellness', href: '/wellness', icon: <Activity className="h-4 w-4" /> },
  { label: 'Bookings', href: '/bookings', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Community', href: '/community', icon: <Users className="h-4 w-4" /> },
  { label: 'Events', href: '/events', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Resources', href: '/resources', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', href: '/profile', icon: <User className="h-4 w-4" />, requiresAuth: true },
];

export const MainNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">VibeWell</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigationItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 ${
                  isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-bold">VibeWell</span>
              </Link>
            </div>
            <nav className="flex flex-col space-y-4 px-7 pb-4 pt-4">
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80 ${
                    isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
