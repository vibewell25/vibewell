import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Providers } from '@/app/providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import BottomNav from '@/components/common/BottomNav';
import type { ReactNode } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { Toaster } from 'react-hot-toast';
import LiveChat from '@/components/LiveChat';
import ChatBot from '@/components/ChatBot';

export const metadata: Metadata = {
  title: 'VibeWell – Your Wellness Journey Starts Here',
  description: 'VibeWell connects you with wellness services, events, and community.',
};

const inter = Inter({ subsets: ['latin'] });

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const headerList = headers();
  const userAgent = headerList.get('user-agent') ?? '';
  const isMobile = /mobile/i.test(userAgent);
  const initialState = { isMobile, theme: 'light', language: 'en' };

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <UserProvider>
          <Providers initialState={initialState}>
            <Suspense fallback={null}>{children}</Suspense>

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
