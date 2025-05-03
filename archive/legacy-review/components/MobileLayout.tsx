'use client';

import React from 'react';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

export function MobileLayout({ children, hideNavigation = false }: MobileLayoutProps) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  // Check for iOS device and online status
  useEffect(() => {
    // Detect iOS
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);
    
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for network status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex min-h-screen flex-col ${isIOS ? 'pb-safe-bottom pt-safe-top' : ''}`}>
      {/* Performance monitoring */}
      <Suspense fallback={null}>
        <SpeedInsights />
      </Suspense>

      {/* Top header navigation - shown if hideNavigation is false */}
      {!hideNavigation && <MainNavigation />}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-red-500 px-4 py-2 text-center text-sm text-white">
          You are currently offline. Some features may be limited.
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-auto ${!hideNavigation ? 'mb-16 mt-16' : ''}`}>
        {children}
      </main>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
} 