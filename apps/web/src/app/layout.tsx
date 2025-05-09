import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Providers } from './providers';
import NavigationWrapper from '@/components/navigation/NavigationWrapper';

export const metadata: Metadata = {
  title: 'VibeWell',
  description: 'Your wellness journey starts here',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers initialState={{ 
          isMobile: false, 
          theme: 'light',
          language: 'en'
        }}>
          <NavigationWrapper />
          <div className="pt-16">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
