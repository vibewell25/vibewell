'use client';

import React from 'react';
import { Header } from './layout/Header';
import { Footer } from './footer';
import SkipLink from '@/components/SkipLink';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  width?: 'default' | 'full';
  maxWidth?: string;
}

export function Layout({
  children,
  showHeader = true,
  showFooter = true,
  width = 'default',
  maxWidth = '1400px',
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SkipLink targetId="main-content" />
      
      {showHeader && <Header />}
      
      {width === 'full' ? (
        <main id="main-content" className="flex-1">
          {children}
        </main>
      ) : (
        <main id="main-content" className="flex-1 px-4 py-8">
          <div className="mx-auto" style={{ maxWidth }}>
            {children}
          </div>
        </main>
      )}
      
      {showFooter && <Footer />}
    </div>
  );
} 