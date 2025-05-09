"use client";

import { AuthProvider } from '@/contexts/AuthContext';
// Import issues - temporarily commented out
// import { AnalyticsProvider } from '@/providers/AnalyticsProvider';
import { ThemeProvider } from 'next-themes';
// import { PushNotificationProvider } from '@/providers/PushNotificationProvider';
// import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
// import RootErrorBoundary from '@/components/RootErrorBoundary';
// import { I18nextProvider } from 'react-i18next';
// import i18n from '@/i18n';
// import { TranslationErrorBoundary } from '@/components/TranslationErrorBoundary';
// import { TranslationLoader } from '@/components/TranslationLoader';
import { ReactNode } from 'react';
// import { RecoilRoot } from 'recoil';

interface ProvidersProps {
  children: ReactNode;
  initialState: {
    isMobile: boolean;
    theme: string;
    language: string;
  }
}

export function Providers({ children, initialState }: ProvidersProps) {
  return (
    // Temporarily simplified providers structure to fix dependency issues
    <ThemeProvider attribute="class" defaultTheme={initialState.theme} enableSystem>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
