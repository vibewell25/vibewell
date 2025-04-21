import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

/**
 * Analytics wrapper component that includes Vercel Analytics and Speed Insights
 */
export function AnalyticsWrapper({ children }: AnalyticsWrapperProps): React.ReactElement {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default AnalyticsWrapper; 