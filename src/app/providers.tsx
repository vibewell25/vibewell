'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { PushNotificationProvider } from '@/providers/push-notification-provider';
import { useEffect } from 'react';
import RootErrorBoundary from '@/components/RootErrorBoundary';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { TranslationErrorBoundary } from '@/components/TranslationErrorBoundary';
import { TranslationLoader } from '@/components/TranslationLoader';

interface ProvidersProps {
  children: React.ReactNode;
  defaultLanguage: string;
  defaultDir: 'ltr' | 'rtl';
}

export default function Providers({
  children,
  defaultLanguage,
  defaultDir,
}: ProvidersProps) {
  // Initialize i18n with default language
  useEffect(() => {
    if (i18n.language !== defaultLanguage) {
      i18n.changeLanguage(defaultLanguage);
      document.documentElement.dir = defaultDir;
    }
  }, [defaultLanguage, defaultDir]);

  // Register service worker
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const { registerServiceWorker } = require('@/utils/registerServiceWorker');
      registerServiceWorker();
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <TranslationErrorBoundary>
        <TranslationLoader>
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
        </TranslationLoader>
      </TranslationErrorBoundary>
    </I18nextProvider>
  );
} 