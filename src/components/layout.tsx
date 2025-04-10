'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { SkipLink } from './ui/skip-link';
import { LiveAnnouncer } from './ui/live-announcer';
import { Container } from './ui/container';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Layout({
  children,
  hideHeader = false,
  hideFooter = false,
  fullWidth = false,
  maxWidth = 'xl'
}: LayoutProps) {
  return (
    <>
      {/* Accessibility components */}
      <SkipLink targetId="main-content" />
      <LiveAnnouncer politeness="polite" />
      
      {/* Main layout */}
      {!hideHeader && <Header />}
      
      <main id="main-content" tabIndex={-1}>
        {fullWidth ? (
          children
        ) : (
          <Container maxWidth={maxWidth} className="py-6">
            {children}
          </Container>
        )}
      </main>
      
      {!hideFooter && <Footer />}
    </>
  );
} 