import React, { useState, useEffect, useCallback } from 'react';

interface LiveAnnouncerProps {
  politeness?: 'polite' | 'assertive';
}

/**
 * LiveAnnouncer - Provides a way to announce dynamic content changes
 * to screen readers using ARIA live regions.
 * 
 * Usage:
 * - Import and place this component once at the root of your app
 * - Use the global `window.announcer.announce("Your message")` method
 * to announce important updates to screen readers
 */
export function LiveAnnouncer({ politeness = 'polite' }: LiveAnnouncerProps) {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string) => {
    // Clear first to ensure announcement on repeated messages
    setMessage('');
    
    // Use requestAnimationFrame to ensure the DOM has a chance to update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMessage(text);
      });
    });
  }, []);

  // Add the announcer to the window object for global access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.announcer = { announce };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.announcer;
      }
    };
  }, [announce]);

  return (
    <div 
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Type definition for the global announcer
declare global {
  interface Window {
    announcer?: {
      announce: (message: string) => void;
    };
  }
} 