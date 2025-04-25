import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutProviders } from '@/components/providers/layout-providers';
import Script from 'next/script';
import { Suspense } from 'react';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import BottomNav from '@/components/common/BottomNav';

// Import the Inter font with subset optimization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Static metadata
export const metadata: Metadata = {
  title: {
    default: 'VibeWell - Your Wellness Journey',
    template: '%s | VibeWell'
  },
  description: 'Connect with wellness services, events, and community',
  keywords: ['wellness', 'health', 'community', 'events', 'services'],
  authors: [{ name: 'VibeWell Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibewell.com',
    siteName: 'VibeWell',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VibeWell'
      }
    ]
  }
};

// Static viewport
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  width: 'device-width',
  initialScale: 1
};

async function getInitialState() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);
  
  return {
    isMobile,
    theme: 'light', // Default theme, will be updated client-side
    language: 'en' // Default language, will be updated client-side
  };
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const initialState = await getInitialState();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers initialState={initialState}>
          <Suspense fallback={null}>
            {children}
          </Suspense>
          
          {/* Analytics and Speed Insights are loaded only in production */}
          {process.env.NODE_ENV === 'production' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}