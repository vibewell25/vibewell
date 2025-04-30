import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Providers } from '@/components/providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import BottomNav from '@/components/common/BottomNav';
import { type ReactNode } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { Toaster } from 'react-hot-toast';
import LiveChat from '@/components/LiveChat';
import ChatBot from '@/components/ChatBot';

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
  const nonce = headers().get('x-nonce') ?? undefined;
  const initialState = { nonce };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UserProvider>
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
            <Toaster />
            <LiveChat />
            <ChatBot />
          </Providers>
        </UserProvider>
      </body>
    </html>
  );
}
