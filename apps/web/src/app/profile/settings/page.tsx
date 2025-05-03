'use client';
import { MobileLayout } from '@/components/layout/MobileLayout';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { Icons } from '@/components/icons';
export default function SettingsPage() {
  const { theme } = useTheme();
  const settingsOptions = [
    {
      id: 'appearance',
      name: 'Appearance & Theme',
      description: 'Customize your experience',
      icon: PaintBrushIcon,
      href: '/profile/settings/theme',
      indicator: theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System',
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
      indicator: 'English',
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
      <div className="min-h-screen bg-background pb-16">
        {/* Header with Back Button */}
        <div className="flex items-center border-b border-border bg-card px-5 py-4">
          <Link href="/profile/mobile" className="mr-4">
            <Icons?.ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <div className="py-4">
          <div className="px-5 py-2">
            {settingsOptions?.map((option, index) => (
              <Link
                key={option?.id}
                href={option?.href}
                className="flex items-center justify-between border-b border-border py-3 last:border-0"
              >
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <option?.icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{option?.name}</div>
                    <div className="text-sm text-muted-foreground">{option?.description}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {option?.indicator && (
                    <span className="mr-2 text-sm text-muted-foreground">{option?.indicator}</span>
                  )}
                  <Icons?.ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 px-5 py-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Vibewell App</p>
              <p>Version 1?.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
