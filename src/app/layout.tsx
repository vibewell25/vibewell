import './globals.css';

import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import { LiveAnnouncer } from '@/components/ui/live-announcer';
import SkipLink from '@/components/SkipLink';
import { ThemeProvider } from '@/components/theme-provider';
import RootErrorBoundary from '@/components/RootErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vibewell',
  description: 'Connect with wellness and beauty service providers',
  icons: {
    icon: '/images/favicon.svg',
    apple: '/images/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SkipLink targetId="main-content" />
        <LiveAnnouncer />
        <ThemeProvider defaultTheme="system" enableSystem>
          <AnalyticsProvider>
            <AuthProvider>
              <RootErrorBoundary>
                <main id="main-content">
                  {children}
                </main>
              </RootErrorBoundary>
            </AuthProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
