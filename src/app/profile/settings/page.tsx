'use client';

import { MobileLayout } from '@/components/layout/MobileLayout';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  Cog6ToothIcon, 
  PaintBrushIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  LanguageIcon,
  UserIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/components/theme-provider';

export default function SettingsPage() {
  const { theme } = useTheme();

  const settingsOptions = [
    {
      id: 'appearance',
      name: 'Appearance & Theme',
      description: 'Customize your experience',
      icon: PaintBrushIcon,
      href: '/profile/settings/theme',
      indicator: theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Manage your alerts',
      icon: BellIcon,
      href: '/profile/settings/notifications',
    },
    {
      id: 'privacy',
      name: 'Privacy & Security',
      description: 'Control your data and account',
      icon: ShieldCheckIcon,
      href: '/profile/settings/privacy',
    },
    {
      id: 'language',
      name: 'Language & Region',
      description: 'Set your preferences',
      icon: LanguageIcon,
      href: '/profile/settings/language',
      indicator: 'English'
    },
    {
      id: 'account',
      name: 'Account',
      description: 'Manage your account details',
      icon: UserIcon,
      href: '/profile/settings/account',
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Configure accessibility features',
      icon: DevicePhoneMobileIcon,
      href: '/profile/settings/accessibility',
    },
  ];

  return (
    <MobileLayout>
      <div className="bg-background min-h-screen pb-16">
        {/* Header with Back Button */}
        <div className="bg-card px-5 py-4 flex items-center border-b border-border">
          <Link href="/profile/mobile" className="mr-4">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        <div className="py-4">
          <div className="px-5 py-2">
            {settingsOptions.map((option, index) => (
              <Link 
                key={option.id}
                href={option.href}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {option.indicator && (
                    <span className="text-sm text-muted-foreground mr-2">{option.indicator}</span>
                  )}
                  <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          <div className="px-5 py-4 mt-4">
            <div className="text-sm text-muted-foreground text-center">
              <p>Vibewell App</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}