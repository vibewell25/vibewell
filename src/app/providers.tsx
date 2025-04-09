'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/contexts/NotificationContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure hydration doesn't cause mismatch with server rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
} 