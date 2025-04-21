import React from 'react';
import { Analytics } from '@vercel/analytics/react';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics provider component that includes Vercel Analytics
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps): React.ReactElement {
  return (
    <>
      <Analytics />
      {children}
    </>
  );
}

export default AnalyticsProvider; 