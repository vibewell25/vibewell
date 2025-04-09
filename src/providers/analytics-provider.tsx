'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { EventName } from '@/services/analytics-service';

// This matches exactly what useAnalytics returns
type AnalyticsContextType = ReturnType<typeof useAnalytics>;

// Create the context with an undefined initial value
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Custom hook to use the analytics context
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  
  return context;
}

// Props for the provider component
interface AnalyticsProviderProps {
  children: ReactNode;
}

// Provider component
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // useAnalytics hook returns all the tracking functions we need
  const analytics = useAnalytics();
  
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
} 