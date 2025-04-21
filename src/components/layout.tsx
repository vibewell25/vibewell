'use client';

import React from 'react';
import { Header } from './layout/Header';
import { Footer } from './footer';
import SkipLink from '@/components/SkipLink';
import { Navigation } from '@/components/navigation';
import { MobileNav } from '@/components/mobile-nav';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/ui/toast';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  width?: 'default' | 'full';
  maxWidth?: string;
  showNav?: boolean;
  className?: string;
}

export function Layout({
  children,
  showHeader = true,
  showFooter = true,
  width = 'default',
  maxWidth = '1400px',
  showNav = true,
  className,
}: LayoutProps) {
  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}
