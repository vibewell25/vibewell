'use client';

import { useEffect } from 'react';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export function useAnalytics() {
  useEffect(() => {
    // Initialize analytics if needed
    // This is where you would initialize your analytics service
    console.log('Analytics initialized');
  }, []);

  const trackEvent = (name: string, properties?: Record<string, any>) => {
    // Here you would send the event to your analytics service
    // For now, we'll just log it
    console.log('Analytics Event:', { name, properties });

    // Example of sending to an analytics service:
    // if (window.analytics) {
    //   window.analytics.track(name, properties);
    // }

    // You can also send to your backend:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ name, properties }),
    // });
  };

  const trackPageView = (path: string) => {
    trackEvent('page_view', { path });
  };

  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname);

    // Track subsequent page views
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return {
    trackEvent,
    trackPageView,
  };
}
