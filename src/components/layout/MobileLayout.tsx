import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/theme-selector';

interface MobileLayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

export function MobileLayout({ children, hideNavigation = false }: MobileLayoutProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    {
      name: 'Feed',
      href: '/feed',
      icon: Icons.HomeIcon,
      activeIcon: Icons.HomeSolid,
      isActive: pathname === '/feed' || pathname === '/',
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: Icons.MapPinIcon,
      activeIcon: Icons.MapPinSolid,
      isActive: pathname?.includes('/bookings'),
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: Icons.ChatBubbleLeftIcon,
      activeIcon: Icons.ChatBubbleLeftSolid,
      isActive: pathname?.includes('/messages'),
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: Icons.UserIcon,
      activeIcon: Icons.UserSolid,
      isActive: pathname?.includes('/profile'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 pb-16 overflow-auto">{children}</div>

      {!hideNavigation && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 z-10">
            <div className="flex justify-around items-center h-16">
              {navItems.map(item => {
                const Icon = item.isActive ? item.activeIcon : item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                      item.isActive
                        ? 'text-primary font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span>{item.name}</span>
                    {item.isActive && (
                      <div className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-t-full" />
                    )}
                  </Link>
                );
              })}

              <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                  <button className="flex flex-col items-center justify-center w-full h-full text-xs text-gray-500 dark:text-gray-400">
                    <Icons.Cog6ToothIcon className="w-6 h-6 mb-1" />
                    <span>Settings</span>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-auto max-h-[80vh] overflow-auto rounded-t-xl"
                >
                  <div className="py-6 px-2">
                    <h2 className="text-xl font-bold mb-4">Settings</h2>
                    <div className="space-y-6">
                      <ThemeSelector variant="mobile" showColorThemes={true} />

                      <div>
                        <h3 className="text-lg font-medium mb-2">Accessibility</h3>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" className="justify-start">
                            Text Size
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Screen Reader Support
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Reduced Motion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
