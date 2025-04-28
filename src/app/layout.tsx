import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import BottomNav from '@/components/common/BottomNav';

// Static metadata
export {};

// Static viewport
export {};

async function getInitialState() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);

  return {
    isMobile,
    theme: 'light', // Default theme, will be updated client-side
    language: 'en', // Default language, will be updated client-side
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialState = await getInitialState();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers initialState={initialState}>
          <Suspense fallback={null}>{children}</Suspense>

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
