'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsContextType {
  trackEvent: (category: string, action: string, label?: string, value?: number) => void;
  trackPageView: (path?: string) => void;
  trackTiming: (category: string, variable: string, value: number, label?: string) => void;
  trackException: (description: string, fatal?: boolean) => void;
  gaInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackPageView: () => {},
  trackTiming: () => {},
  trackException: () => {},
  gaInitialized: false,
});

interface AnalyticsProviderProps {
  children: React.ReactNode;
  trackingId?: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children,
  trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID,
}) => {
  const [gaInitialized, setGaInitialized] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize Google Analytics
  useEffect(() => {
    if (!trackingId || gaInitialized) return;

    try {
      ReactGA.initialize(trackingId);
      setGaInitialized(true);
      console.log('Google Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }, [trackingId, gaInitialized]);

  // Track page views
  useEffect(() => {
    if (!gaInitialized) return;

    // Combine pathname and search params for full URL
    const page = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Track page view
    ReactGA.pageview(page);
  }, [pathname, searchParams, gaInitialized]);

  // Track events
  const trackEvent = (
    category: string, 
    action: string, 
    label?: string, 
    value?: number,
  ) => {
    if (!gaInitialized) return;

    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  };

  // Track page views manually
  const trackPageView = (path?: string) => {
    if (!gaInitialized) return;

    ReactGA.pageview(path || pathname);
  };

  // Track timing
  const trackTiming = (
    category: string,
    variable: string,
    value: number,
    label?: string,
  ) => {
    if (!gaInitialized) return;

    ReactGA.timing({
      category,
      variable,
      value,
      label,
    });
  };

  // Track exceptions
  const trackException = (description: string, fatal: boolean = false) => {
    if (!gaInitialized) return;

    ReactGA.exception({
      description,
      fatal,
    });
  };

  return (
    <AnalyticsContext.Provider 
      value={{ 
        trackEvent, 
        trackPageView,
        trackTiming,
        trackException,
        gaInitialized,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext); 