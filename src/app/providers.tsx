'use client';;
import { AuthProvider } from '@/contexts/auth-context';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import { ThemeProvider } from 'next-themes';
import { PushNotificationProvider } from '@/providers/push-notification-provider';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import RootErrorBoundary from '@/components/RootErrorBoundary';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { TranslationErrorBoundary } from '@/components/TranslationErrorBoundary';
import { TranslationLoader } from '@/components/TranslationLoader';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

interface ProvidersProps {
  children: ReactNode;
  initialState: {
    isMobile: boolean;
    theme: string;
    language: string;
  };
}

export function Providers({ children, initialState }: ProvidersProps) {
  return (
    <RootErrorBoundary>
      <RecoilRoot
        initializeState={({ set }) => {
          set({ key: 'deviceType', value: initialState?.isMobile ? 'mobile' : 'desktop' });
          set({ key: 'theme', value: initialState?.theme });
          set({ key: 'language', value: initialState?.language });
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nextProvider i18n={i18n}>
            <TranslationErrorBoundary>
              <TranslationLoader>
                <AuthProvider>
                  <AnalyticsProvider>
                    <PushNotificationProvider>
                      <AccessibilityProvider>{children}</AccessibilityProvider>
                    </PushNotificationProvider>
                  </AnalyticsProvider>
                </AuthProvider>
              </TranslationLoader>
            </TranslationErrorBoundary>
          </I18nextProvider>
        </ThemeProvider>
      </RecoilRoot>
    </RootErrorBoundary>
  );
}
