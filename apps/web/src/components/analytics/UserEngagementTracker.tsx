import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Types for engagement events
type EngagementEvent = 
  | 'page_view'
  | 'scroll_depth'
  | 'time_on_page'
  | 'click'
  | 'hover'
  | 'form_start'
  | 'form_completion'
  | 'form_abandonment'
  | 'resource_download'
  | 'media_start'
  | 'media_complete'
  | 'media_pause'
  | 'share'
  | 'search'
  | 'filter_use'
  | 'navigation'
  | 'modal_open'
  | 'modal_close'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'purchase_complete';

interface AnalyticsEvent {
  event: EngagementEvent;
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface UserEngagementTrackerProps {
  userId?: string;
  sessionId?: string;
  enableScrollTracking?: boolean;
  enableTimeTracking?: boolean;
  scrollDepthMarkers?: number[];
  timeMarkers?: number[];
  sampleRate?: number; // 0-1 for what percentage of users to track
}

/**
 * User Engagement Tracker - Collects user engagement metrics and sends them to analytics
 * 
 * This component tracks various user engagement metrics like scroll depth, time on page,
 * clicks, and other user interactions to provide deeper analytics on user behavior.
 * 
 * @param props - Configuration options for the tracker
 */
export function UserEngagementTracker({
  userId,
  sessionId: propSessionId,
  enableScrollTracking = true,
  enableTimeTracking = true,
  scrollDepthMarkers = [25, 50, 75, 90, 100],
  timeMarkers = [10, 30, 60, 120, 300], // in seconds
  sampleRate = 1.0 // 100% of users by default
}: UserEngagementTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create refs to store state that doesn't need to trigger re-renders
  const trackedScrollDepths = useRef<Set<number>>(new Set());
  const trackedTimeMarkers = useRef<Set<number>>(new Set());
  const pageEntryTime = useRef<number>(Date.now());
  const isTracking = useRef<boolean>(false);
  const sessionId = useRef<string>(propSessionId || generateSessionId());
  
  // Initialize tracking based on sample rate
  useEffect(() => {
    // Determine if this user should be tracked based on sample rate
    if (Math.random() <= sampleRate) {
      isTracking.current = true;
      
      // Track initial page view
      trackEvent('page_view');
    }
    
    return () => {
      // Track final engagement metrics before component unmounts
      if (isTracking.current && enableTimeTracking) {
        const timeOnPage = Math.floor((Date.now() - pageEntryTime.current) / 1000);
        trackEvent('time_on_page', { seconds: timeOnPage, final: true });
      }
    };
  }, []);
  
  // Reset tracking when URL changes
  useEffect(() => {
    if (!isTracking.current) return;
    
    // Reset tracked metrics for new page
    trackedScrollDepths.current.clear();
    trackedTimeMarkers.current.clear();
    pageEntryTime.current = Date.now();
    
    // Track new page view
    trackEvent('page_view');
  }, [pathname, searchParams]);
  
  // Set up scroll depth tracking
  useEffect(() => {
    if (!isTracking.current || !enableScrollTracking) return;
    
    const handleScroll = () => {
      const scrollPercentage = calculateScrollPercentage();
      
      // Check each marker to see if it should be recorded
      scrollDepthMarkers.forEach(marker => {
        if (
          scrollPercentage >= marker && 
          !trackedScrollDepths.current.has(marker)
        ) {
          trackedScrollDepths.current.add(marker);
          trackEvent('scroll_depth', { depth: marker });
        }
      });
    };
    
    // Throttle scroll event for performance
    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 200);
    };
    
    window.addEventListener('scroll', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [enableScrollTracking, scrollDepthMarkers]);
  
  // Set up time on page tracking
  useEffect(() => {
    if (!isTracking.current || !enableTimeTracking) return;
    
    // Check time markers every second
    const timeInterval = setInterval(() => {
      const secondsOnPage = Math.floor((Date.now() - pageEntryTime.current) / 1000);
      
      // Check each time marker
      timeMarkers.forEach(seconds => {
        if (
          secondsOnPage >= seconds && 
          !trackedTimeMarkers.current.has(seconds)
        ) {
          trackedTimeMarkers.current.add(seconds);
          trackEvent('time_on_page', { seconds });
        }
      });
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, [enableTimeTracking, timeMarkers]);
  
  // Track page visibility changes
  useEffect(() => {
    if (!isTracking.current) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeOnPage = Math.floor((Date.now() - pageEntryTime.current) / 1000);
        trackEvent('time_on_page', { seconds: timeOnPage, visibility: 'hidden' });
      } else if (document.visibilityState === 'visible') {
        // Reset the entry time when the page becomes visible again
        pageEntryTime.current = Date.now();
        trackEvent('time_on_page', { visibility: 'visible' });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Generate a unique session ID if not provided
  function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  // Calculate scroll percentage
  function calculateScrollPercentage(): number {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    const clientHeight = document.documentElement.clientHeight;
    
    // Calculate scroll percentage
    const scrollableDistance = scrollHeight - clientHeight;
    if (scrollableDistance <= 0) return 100; // Page not scrollable
    
    const scrollPercentage = Math.round((scrollTop / scrollableDistance) * 100);
    return Math.min(scrollPercentage, 100); // Cap at 100%
  }
  
  // Send event to analytics
  function trackEvent(event: EngagementEvent, metadata?: Record<string, any>) {
    if (!isTracking.current) return;
    
    const analyticsEvent: AnalyticsEvent = {
      event,
      page: pathname || '',
      timestamp: Date.now(),
      userId: userId,
      sessionId: sessionId.current,
      metadata
    };
    
    // Send to analytics systems
    
    // 1. Google Analytics/Google Tag Manager
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        page_path: pathname,
        user_id: userId,
        session_id: sessionId.current,
        ...metadata
      });
    }
    
    // 2. Send to custom analytics API endpoint
    try {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsEvent),
        // Use keepalive to ensure the request completes even if the page unloads
        keepalive: true
      }).catch(err => {
        // Silent failure for analytics - don't impact user experience
        console.error('Failed to send analytics event:', err);
      });
    } catch (err) {
      // Silent failure
      console.error('Error sending analytics event:', err);
    }
  }
  
  // This component doesn't render anything
  return null;
}

// Global utility to manually track events from anywhere in the app
export const EngagementAnalytics = {
  trackEvent: (
    event: EngagementEvent, 
    metadata?: Record<string, any>,
    options?: { userId?: string; sessionId?: string }
  ) => {
    if (typeof window === 'undefined') return;
    
    // Get or create session ID
    const sessionId = options?.sessionId || 
      localStorage.getItem('analytics_session_id') || 
      `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Store session ID
    if (!localStorage.getItem('analytics_session_id')) {
      localStorage.setItem('analytics_session_id', sessionId);
    }
    
    // Create event data
    const analyticsEvent = {
      event,
      page: window.location.pathname,
      timestamp: Date.now(),
      userId: options?.userId,
      sessionId,
      metadata
    };
    
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', event, {
        page_path: window.location.pathname,
        user_id: options?.userId,
        session_id: sessionId,
        ...metadata
      });
    }
    
    // Send to custom analytics API
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsEvent),
      keepalive: true
    }).catch(console.error);
  }
};

// For TypeScript global window
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

export default UserEngagementTracker; 