'use client';

import { useTheme } from '@/components/theme-provider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Need this to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md ${
          theme === 'light' ? 'bg-muted text-primary' : 'text-muted-foreground'
        }`}
        title="Light mode"
      >
        <SunIcon className="h-5 w-5" />
        <span className="sr-only">Light mode</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md ${
          theme === 'dark' ? 'bg-muted text-primary' : 'text-muted-foreground'
        }`}
        title="Dark mode"
      >
        <MoonIcon className="h-5 w-5" />
        <span className="sr-only">Dark mode</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md ${
          theme === 'system' ? 'bg-muted text-primary' : 'text-muted-foreground'
        }`}
        title="System preference"
      >
        <ComputerDesktopIcon className="h-5 w-5" />
        <span className="sr-only">System preference</span>
      </button>
    </div>
  );
} 