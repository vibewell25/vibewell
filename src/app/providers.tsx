'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { PushNotificationProvider } from '@/providers/push-notification-provider';
import { useEffect } from 'react';
import RootErrorBoundary from '@/components/RootErrorBoundary';

// Import i18n initialization
import '@/i18n';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const { registerServiceWorker } = require('@/utils/registerServiceWorker');
      registerServiceWorker();
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AnalyticsProvider>
        <AuthProvider>
          <PushNotificationProvider>
            <RootErrorBoundary>
              {children}
            </RootErrorBoundary>
          </PushNotificationProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
} 