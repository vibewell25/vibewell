'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBadge } from './notification-badge';
import { MessageNotificationBadge } from './message-notification-badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { AdminNavigation } from './navigation/AdminNavigation';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Wellness', href: '/wellness' },
  { name: 'Beauty', href: '/beauty' },
  { name: 'Business Directory', href: '/business-directory' },
  { name: 'Business Hub', href: '/business-hub' },
  { name: 'Pricing', href: '/custom-pricing' },
  { name: 'Social', href: '/social' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user) {
      const checkRole = async () => {
        try {
          const response = await fetch('/api/users/currentRole');
          const data = await response.json();
          setIsAdmin(data.role === 'admin');
        } catch (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        }
      };
      
      checkRole();
    }
  }, [user]);

  const authenticatedNavigation = [
    ...navigation,
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Messages', href: '/messages' },
  ];

  const navItems = user ? authenticatedNavigation : navigation;

  return (
    <header className="bg-background border-b border-border">
      <div className="container-app py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Vibewell</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Admin navigation link for admins */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="text-foreground hover:text-primary transition-colors flex items-center"
                >
                  <span>Admin</span>
                  <span className="ml-1 inline-block">
                    {isAdminMenuOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    )}
                  </span>
                </button>
                
                {isAdminMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-card rounded-md shadow-lg border border-border py-1 z-10 w-64">
                    <AdminNavigation className="py-0" />
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center space-x-4">
                    <NotificationBadge />
                    <MessageNotificationBadge />
                    
                    <div className="relative">
                      <button
                        className="flex items-center text-sm focus:outline-none"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      >
                        <span className="sr-only">Open user menu</span>
                        <UserCircleIcon className="h-8 w-8 text-muted-foreground hover:text-foreground" />
                      </button>
                      
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border border-border py-1 z-10">
                          <div className="px-4 py-2 border-b border-border">
                            <p className="text-sm font-medium">
                              {user ? (user as any).user_metadata?.full_name || user.email : ''}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Your Profile
                          </Link>
                          <Link
                            href="/profile/engagement"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Engagement Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Settings
                          </Link>
                          <Link
                            href="/notifications"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Notifications
                            {unreadCount > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-secondary rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/messages"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Messages
                          </Link>
                          <Link
                            href="/profile/edit"
                            className="block px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Edit Profile
                          </Link>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut();
                            }}
                          >
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/sign-in" className="hidden md:block btn-primary">
                    Sign In
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4 pt-2 pb-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/profile/engagement"
                        className="text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Engagement Profile
                      </Link>
                      <Link
                        href="/notifications"
                        className="text-foreground hover:text-primary transition-colors flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-secondary rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/messages"
                        className="text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Messages
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Edit Profile
                      </Link>
                      <button
                        className="text-left text-red-600 hover:text-red-500 transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut();
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link 
                      href="/auth/sign-in" 
                      className="btn-primary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 