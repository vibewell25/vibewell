'use client';

import './globals.css';

import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LiveAnnouncer } from '@/components/ui/live-announcer';
import SkipLink from '@/components/SkipLink';
import Providers from './providers';
import { useEffect } from 'react';
import { performanceMonitoring } from '@/utils/monitoring';
import '../i18n/config';
import '../styles/rtl.css';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitoring.trackPageLoad();

    // Set document direction based on language
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n]);

  return (
    <html lang={i18n.language} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Security headers will be added by the middleware */}
      </head>
      <body className={inter.className}>
        <SkipLink targetId="main-content" />
        <LiveAnnouncer />
        <Providers>
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
