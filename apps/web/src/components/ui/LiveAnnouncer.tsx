import { useState, useEffect, useCallback } from 'react';

/**
 * Props for the LiveAnnouncer component
 * @property {('polite'|'assertive')} [politeness='polite'] - The ARIA live politeness setting:
 *  - 'polite': Announces changes when the user is idle (default, used for most situations)
 *  - 'assertive': Announces changes immediately, interrupting any current speech
 *                 (use only for critical updates like errors)
 */
interface LiveAnnouncerProps {
  politeness?: 'polite' | 'assertive';
}

/**
 * LiveAnnouncer - A component that provides screen reader announcements for dynamic content changes
 * 
 * This component creates an ARIA live region that screen readers will monitor for changes.
 * When content is added to this region, screen readers will announce it to users.
 * 
 * @example
 * ```tsx
 * // Place once at the root of your application
 * function App() {
 *   return (
 *     <>
 *       <LiveAnnouncer />
 *       {/* rest of your app */}
 *     </>
 *   );
 * }
 * 
 * // Then use it anywhere in your application:
 * function SomeComponent() {
 *   const handleAction = () => {
 *     // After some action, announce the result to screen readers
 *     window.announcer?.announce("Your action was successful");
 *   };
 *   
 *   return <button onClick={handleAction}>Perform Action</button>;
 * }
 * ```
 * 
 * @param {LiveAnnouncerProps} props - Component props
 * @returns {JSX.Element} A visually hidden live region for screen reader announcements
 */
export function LiveAnnouncer({ politeness = 'polite' }: LiveAnnouncerProps) {
  const [message, setMessage] = useState('');

  /**
   * Announces a message to screen readers
   * Uses a double requestAnimationFrame technique to ensure reliable announcements,
   * even for repeated messages
   * 
   * @param {string} text - The message to announce to screen readers
   */
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
    
    // Clean up on unmount
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
      data-testid="live-announcer"
    >
      {message}
    </div>
  );
}

/**
 * Type definition for the global announcer object that's attached to the window
 */
declare global {
  interface Window {
    announcer?: {
      /**
       * Announces a message to screen readers through the LiveAnnouncer component
       * @param {string} message - The message to be announced
       */
      announce: (message: string) => void;
    };
  }
}
