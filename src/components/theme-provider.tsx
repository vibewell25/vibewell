'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'dark' | 'light';
  resolvedTheme: 'dark' | 'light';
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  systemTheme: 'light',
  resolvedTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  attribute = 'class',
  storageKey = 'vibewell-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      try {
        // Try to get the theme from local storage
        const storedTheme = localStorage.getItem(storageKey);
        return storedTheme ? (storedTheme as Theme) : defaultTheme;
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');

  // Update system theme based on media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate the resolved theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Custom setTheme function that persists to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system' && enableSystem) {
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, enableSystem, systemTheme]);

  const value = {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
