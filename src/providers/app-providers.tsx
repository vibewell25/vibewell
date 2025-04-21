import React from 'react';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AccessibilityProvider>
      {/* Other providers can be added here */}
      {children}
    </AccessibilityProvider>
  );
}; 