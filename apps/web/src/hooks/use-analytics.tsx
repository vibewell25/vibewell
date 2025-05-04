'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsService, EventName } from '@/services/analytics-service';

export function useAnalytics() {
  const analyticsService = useRef<AnalyticsService | null>(null);
  const lastPath = useRef<string | null>(null);

  // Initialize analytics service
  useEffect(() => {
    if (typeof window !== 'undefined' && !analyticsService.current) {
      analyticsService.current = new AnalyticsService();
    }
  }, []);

  // Track page views
  useEffect(() => {
    // This check ensures we're running on the client
    if (typeof window === 'undefined' || !analyticsService.current) return;

    const trackPageView = () => {
      const path = window.location.pathname;

      // Only track if the path has changed
      if (path !== lastPath.current) {
        lastPath.current = path;

        // Get page title
        const pageTitle = document.title || 'Unknown Page';

        // Track the page view
        analyticsService.current.trackEvent('page_view', {
          path,
          title: pageTitle,
          referrer: document.referrer || '',
          url: window.location.href,
        });
      }
    };

    // Track initial page view
    trackPageView();

    // Set up listener for route changes
    const handleRouteChange = () => {
      // Small timeout to allow the page to fully load
      setTimeout(trackPageView, 100);
    };

    // Add listener
    window.addEventListener('popstate', handleRouteChange);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Function to track an event
  const trackEvent = useCallback((event: EventName, properties: Record<string, any> = {}) => {
    if (!analyticsService.current) {
      console.warn('Analytics service not initialized');
      return;
    }

    analyticsService.current.trackEvent(event, properties);
  }, []);

  // Function to track product views
  const trackProductView = useCallback(
    (productId: string, productName: string, productDetails: Record<string, any> = {}) => {
      trackEvent('product_view', {
        product_id: productId,
        product_name: productName,
        ...productDetails,
      });
    },
    [trackEvent],
  );

  // Function to track product try-ons
  const trackProductTryOn = useCallback(
    (
      productId: string,
      productName: string,
      action: 'start' | 'complete' | 'cancel',
      details: Record<string, any> = {},
    ) => {
      trackEvent('product_try_on', {
        product_id: productId,
        product_name: productName,
        action,
        ...details,
      });
    },
    [trackEvent],
  );

  // Function to track search
  const trackSearch = useCallback(
    (query: string, results: number, filters: Record<string, any> = {}) => {
      trackEvent('product_search', {
        query,
        results_count: results,
        filters,
      });
    },
    [trackEvent],
  );

  // Function to track filter usage
  const trackFilter = useCallback(
    (filters: Record<string, any>, results: number) => {
      trackEvent('product_filter', {
        filters,
        results_count: results,
      });
    },
    [trackEvent],
  );

  // Function to track recommendation clicks
  const trackRecommendationClick = useCallback(
    (productId: string, productName: string, position: number, source: string) => {
      trackEvent('product_recommendation_click', {
        product_id: productId,
        product_name: productName,
        position,
        source,
      });
    },
    [trackEvent],
  );

  // Function to track product shares
  const trackShare = useCallback(
    (productId: string, productName: string, shareMethod: 'social' | 'email' | 'download') => {
      trackEvent('product_share', {
        product_id: productId,
        product_name: productName,
        share_method: shareMethod,
      });
    },
    [trackEvent],
  );

  // Function to track feedback submission
  const trackFeedback = useCallback(
    (
      productId: string,
      productName: string,
      rating: number,
      wouldTryInRealLife: boolean,
      hasComment: boolean,
    ) => {
      trackEvent('product_feedback_submit', {
        product_id: productId,
        product_name: productName,
        rating,
        would_try: wouldTryInRealLife,
        has_comment: hasComment,
      });
    },
    [trackEvent],
  );

  // Function to track cart actions
  const trackCartAction = useCallback(
    (
      action: 'add' | 'remove',
      productId: string,
      productName: string,
      quantity: number,
      price: number,
    ) => {
      trackEvent(action === 'add' ? 'cart_add' : 'cart_remove', {
        product_id: productId,
        product_name: productName,
        quantity,
        price,
        value: price * quantity,
      });
    },
    [trackEvent],
  );

  return {
    trackEvent,
    trackProductView,
    trackProductTryOn,
    trackSearch,
    trackFilter,
    trackRecommendationClick,
    trackShare,
    trackFeedback,
    trackCartAction,
  };
}
