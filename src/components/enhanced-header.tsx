import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBadge } from './notification-badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { useResponsive } from '@/hooks/useResponsive';
import { TouchHandler } from './ui/touch-handler';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Wellness', href: '/wellness' },
  { name: 'Business Directory', href: '/business-directory' },
  { name: 'Business Hub', href: '/business-hub' },
  { name: 'Pricing', href: '/custom-pricing' },
  { name: 'Social', href: '/social' },
];

export function EnhancedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const { isMobile, isTablet } = useResponsive();
  const authenticatedNavigation = [
    ...navigation,
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Messages', href: '/messages' },
  ];
  const navItems = user ? authenticatedNavigation : navigation;
  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Handle swipe gesture to open/close mobile menu
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isMobile || isTablet) {
      if (direction === 'right' && !isMenuOpen) {
        setIsMenuOpen(true);
      } else if (direction === 'left' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu when clicking outside
      if (isUserMenuOpen) {
        const userMenuElement = document.getElementById('user-menu');
        const userMenuButton = document.getElementById('user-menu-button');
        if (
          userMenuElement && 
          !userMenuElement.contains(event.target as Node) && 
          userMenuButton && 
          !userMenuButton.contains(event.target as Node)
        ) {
          setIsUserMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);
  // Determine header classes based on scroll state
  const headerClasses = cn(
    'fixed w-full top-0 z-50 transition-all duration-200',
    isScrolled 
      ? 'bg-background/90 backdrop-blur-md shadow-sm' 
      : 'bg-background',
    'border-b border-border'
  );
  return (
    <TouchHandler onSwipe={handleSwipe}>
      <header className={headerClasses}>
        <div className="container-app py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl md:text-2xl font-bold text-primary">Vibewell</span>
              </Link>
            </div>
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors text-sm lg:text-base"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-2 md:space-x-4">
              <ThemeToggle />
              {!loading && (
                <>
                  {user ? (
                    <>
                      {/* Mobile action buttons */}
                      <div className="flex md:hidden space-x-2">
                        <Link href="/messages" className="p-2 rounded-full hover:bg-muted">
                          <Icons.ChatBubbleLeftIcon className="h-5 w-5 text-muted-foreground" />
                        </Link>
                        <Link href="/notifications" className="p-2 rounded-full hover:bg-muted relative">
                          <Icons.BellIcon className="h-5 w-5 text-muted-foreground" />
                          {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-secondary flex items-center justify-center text-[10px] text-white font-bold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      </div>
                      {/* Desktop full user menu */}
                      <div className="hidden md:flex items-center space-x-4">
                        <NotificationBadge />
                        <div className="relative">
                          <button
                            id="user-menu-button"
                            className="flex items-center text-sm focus:outline-none"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                          >
                            <span className="sr-only">Open user menu</span>
                            <Icons.UserCircleIcon className="h-8 w-8 text-muted-foreground hover:text-foreground" />
                          </button>
                          {isUserMenuOpen && (
                            <div 
                              id="user-menu"
                              className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border border-border py-1 z-10"
                            >
                              <div className="px-4 py-2 border-b border-border">
                                <p className="text-sm font-medium">{user.user_metadata?.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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
                    </>
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
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <Icons.XMarkIcon className="h-6 w-6" />
                ) : (
                  <Icons.Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile navigation with enhanced animation */}
          <div 
            className={cn(
              "fixed inset-0 bg-background z-40 transform transition-transform ease-in-out duration-300 md:hidden",
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
            style={{ top: '64px' }}  // Adjust based on header height
          >
            <div className="flex flex-col h-full overflow-y-auto pb-20">
              <div className="flex flex-col space-y-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="py-3 px-4 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="h-px bg-border my-2"></div>
                        <Link
                          href="/profile"
                          className="py-3 px-4 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/profile/engagement"
                          className="py-3 px-4 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Engagement Profile
                        </Link>
                        <Link
                          href="/notifications"
                          className="py-3 px-4 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors flex items-center justify-between"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-secondary rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/messages"
                          className="py-3 px-4 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Messages
                        </Link>
                        <div className="h-px bg-border my-2"></div>
                        <button
                          className="py-3 px-4 rounded-md text-left text-red-600 hover:bg-muted transition-colors"
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
                        className="mt-4 btn-primary text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Add spacer to prevent content from being hidden under the fixed header */}
      <div className="h-16 md:h-[72px]"></div>
    </TouchHandler>
  );
} 