import './globals.css';

import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import LiveAnnouncer from '@/components/LiveAnnouncer';
import SkipLink from '@/components/SkipLink';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vibewell',
  description: 'Connect with wellness and beauty service providers',
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
        <AnalyticsProvider>
          <AuthProvider>
            <main id="main-content">
              {children}
            </main>
          </AuthProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
