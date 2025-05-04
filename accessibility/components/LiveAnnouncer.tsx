'use client';

import React, { useEffect, useState } from 'react';

interface LiveAnnouncerProps {
  politeness?: 'polite' | 'assertive';
  children?: React.ReactNode;
}

export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({
  politeness = 'polite',
  children
}) => {
  const [message, setMessage] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    // Create a global function to announce messages
    (window as any).announce = (msg: string, priority: 'polite' | 'assertive' = 'polite') => {
      setMessage(msg);
      setAnnouncement(msg);
      // Clear the announcement after a short delay
      setTimeout(() => setAnnouncement(''), 100);
    };

    return () => {
      // Clean up the global function
      delete (window as any).announce;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
      {children}
    </div>
  );
};

export default LiveAnnouncer;

// Type definition for the global announcer
declare global {
  interface Window {
    announcer?: {
      announce: (message: string) => void;
    };
  }
}
