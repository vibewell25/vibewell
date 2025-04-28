'use client';

import { useTheme } from '@/components/theme-provider';
import { Icons } from '@/components/icons';
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
        className={`rounded-md p-2 ${
          theme === 'light' ? 'text-primary bg-muted' : 'text-muted-foreground'
        }`}
        title="Light mode"
      >
        <Icons.SunIcon className="h-5 w-5" />
        <span className="sr-only">Light mode</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`rounded-md p-2 ${
          theme === 'dark' ? 'text-primary bg-muted' : 'text-muted-foreground'
        }`}
        title="Dark mode"
      >
        <Icons.MoonIcon className="h-5 w-5" />
        <span className="sr-only">Dark mode</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`rounded-md p-2 ${
          theme === 'system' ? 'text-primary bg-muted' : 'text-muted-foreground'
        }`}
        title="System preference"
      >
        <Icons.ComputerDesktopIcon className="h-5 w-5" />
        <span className="sr-only">System preference</span>
      </button>
    </div>
  );
}
