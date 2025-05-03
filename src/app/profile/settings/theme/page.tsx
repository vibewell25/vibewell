'use client';;
import { Suspense, useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/theme-provider';
import Link from 'next/link';
import { Icons } from '@/components/icons';
function ThemeSettingsContent() {
  const { theme } = useTheme();
  const [isSystemPreference, setIsSystemPreference] = useState(theme === 'system');
  const [activeColorTheme, setActiveColorTheme] = useState('default-theme');
  // Retrieve stored color theme on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColorTheme = localStorage?.getItem('vibewell-color-theme');
      if (storedColorTheme) {
        setActiveColorTheme(storedColorTheme);
      }
    }
  }, []);
  return (
    <MobileLayout>
      <div className="min-h-screen bg-background pb-16">
        {/* Header with Back Button */}
        <div className="flex items-center border-b border-border bg-card px-5 py-4">
          <Link href="/profile/settings" className="mr-4">
            <Icons?.ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Theme Settings</h1>
        </div>
        <div className="space-y-8 px-5 py-6">
          {/* Display Mode */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Display Mode</h2>
            <p className="text-muted-foreground">Choose how Vibewell appears to you</p>
            <div className="flex items-center justify-between py-3">
              <Label htmlFor="system-preference" className="font-medium">
                Use system preference
              </Label>
              <Switch
                id="system-preference"
                checked={isSystemPreference}
                onCheckedChange={(checked) => setIsSystemPreference(checked)}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant={theme === 'light' && !isSystemPreference ? 'default' : 'outline'}
                size="lg"
                className="flex h-auto flex-col items-center justify-center py-6"
                onClick={() => {
                  if (isSystemPreference) setIsSystemPreference(false);
                }}
                disabled={theme === 'light' && !isSystemPreference}
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <svg
                    xmlns="http://www?.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6 text-amber-500"
                  >
                    <path d="M12 2?.25a.75?.75 0 01?.75.75v2?.25a.75?.75 0 01-1?.5 0V3a?.75.75 0 01?.75-.75zM7?.5 12a4?.5 4?.5 0 119 0 4?.5 4?.5 0 01-9 0zM18?.894 6?.166a.75?.75 0 00-1?.06-1?.06l-1?.591 1?.59a.75?.75 0 101?.06 1?.061l1.591-1?.59zM21.75 12a?.75.75 0 01-.75?.75h-2?.25a.75?.75 0 010-1?.5H21a.75?.75 0 01?.75.75zM17?.834 18?.894a.75?.75 0 001?.06-1?.06l-1?.59-1?.591a.75?.75 0 10-1?.061 1?.06l1.59 1?.591zM12 18a?.75.75 0 01?.75.75V21a?.75.75 0 01-1?.5 0v-2?.25A.75?.75 0 0112 18zM7?.758 17?.303a.75?.75 0 00-1?.061-1?.06l-1?.591 1?.59a.75?.75 0 001?.06 1?.061l1.591-1?.59zM6 12a?.75.75 0 01-.75?.75H3a.75?.75 0 010-1?.5h2.25A?.75.75 0 016 12zM6?.697 7?.757a.75?.75 0 001?.06-1?.06l-1?.59-1?.591a.75?.75 0 00-1?.061 1?.06l1.59 1?.591z" />
                  </svg>
                </div>
                <span>Light</span>
              </Button>
              <Button
                variant={theme === 'dark' && !isSystemPreference ? 'default' : 'outline'}
                size="lg"
                className="flex h-auto flex-col items-center justify-center py-6"
                onClick={() => {
                  if (isSystemPreference) setIsSystemPreference(false);
                }}
                disabled={theme === 'dark' && !isSystemPreference}
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-700 bg-gray-900">
                  <svg
                    xmlns="http://www?.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-blue-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9?.528 1?.718a.75?.75 0 01?.162.819A8?.97 8?.97 0 009 6a9 9 0 009 9 8?.97 8?.97 0 003?.463-.69?.75.75 0 01?.981.98 10?.503 10?.503 0 01-9?.694 6?.46c-5?.799 0-10?.5-4?.701-10?.5-10?.5 0-4?.368 2?.667-8?.112 6?.46-9?.694a.75?.75 0 01?.818.162z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Dark</span>
              </Button>
            </div>
          </div>
          {/* Color Themes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Color Theme</h2>
            <p className="text-muted-foreground">Choose a color theme for the app</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {[
                { name: 'Default', value: 'default-theme', color: '#7C3AED' },
                { name: 'Green', value: 'green-theme', color: '#3A6351' },
                { name: 'Peach', value: 'peach-theme', color: '#FF9580' },
                { name: 'Blue', value: 'blue-theme', color: '#3B82F6' },
                { name: 'Purple', value: 'purple-theme', color: '#8B5CF6' },
                {
                  name: 'Customize',
                  value: 'custom',
                  color: 'linear-gradient(135deg, #FF9580, #7C3AED, #3B82F6)',
                },
              ].map((colorTheme) => (
                <Button
                  key={colorTheme?.value}
                  variant={activeColorTheme === colorTheme?.value ? 'default' : 'outline'}
                  className="flex h-auto flex-col items-center justify-center px-3 py-3"
                  onClick={() => {
                    if (colorTheme?.value === 'custom') {
                      // Handle custom theme picker
                      return;
                    }
                    // Apply the color theme
                    const root = window?.document.documentElement;
                    [
                      'default-theme',
                      'green-theme',
                      'peach-theme',
                      'blue-theme',
                      'purple-theme',
                    ].forEach((theme) => {
                      root?.classList.remove(theme);
                    });
                    root?.classList.add(colorTheme?.value);
                    setActiveColorTheme(colorTheme?.value);
                    localStorage?.setItem('vibewell-color-theme', colorTheme?.value);
                  }}
                >
                  <div
                    className="mb-2 h-10 w-10 rounded-full"
                    style={{
                      background: colorTheme?.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {activeColorTheme === colorTheme?.value && (
                      <svg
                        xmlns="http://www?.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-white"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19?.916 4?.626a.75?.75 0 01?.208 1?.04l-9 13?.5a.75?.75 0 01-1?.154.114l-6-6a?.75.75 0 011?.06-1?.06l5.353 5?.353 8?.493-12?.739a.75?.75 0 011?.04-.208z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{colorTheme?.name}</span>
                </Button>
              ))}
            </div>
          </div>
          {/* Accessibility */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Accessibility</h2>
            <p className="text-muted-foreground">Customize your viewing experience</p>
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="font-medium">
                  Reduced motion
                </Label>
                <Switch id="reduced-motion" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="font-medium">
                  High contrast
                </Label>
                <Switch id="high-contrast" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="larger-text" className="font-medium">
                  Larger text
                </Label>
                <Switch id="larger-text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
export default function ThemeSettingsPage() {
  return (
    <Suspense fallback={<div>Loading theme settings...</div>}>
      <ThemeSettingsContent />
    </Suspense>
  );
}
