'use client';

import React, { useEffect } from 'react';
import { useAccessibilityContext } from '@/contexts/AccessibilityContext';

interface AccessibilityStyleProviderProps {
  children: React.ReactNode;
}

export const AccessibilityStyleProvider: React.FC<AccessibilityStyleProviderProps> = ({ 
  children 
}) => {
  const { preferences } = useAccessibilityContext();
  
  useEffect(() => {
    // Apply accessibility classes to the document body based on preferences
    const body = document.body;
    
    // Note: The actual classes are already applied by the useAccessibility hook,
    // but we're adding additional styling enhancements here
    
    // Apply additional styling for high contrast if needed
    if (preferences.highContrast) {
      document.documentElement.style.setProperty('--text-contrast-multiplier', '1.2');
    } else {
      document.documentElement.style.removeProperty('--text-contrast-multiplier');
    }
    
    // Apply additional styling for large text if needed
    if (preferences.largeText) {
      document.documentElement.style.setProperty('--base-font-size-multiplier', '1.25');
    } else {
      document.documentElement.style.removeProperty('--base-font-size-multiplier');
    }
    
    // Cleanup function to reset styles when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--text-contrast-multiplier');
      document.documentElement.style.removeProperty('--base-font-size-multiplier');
    };
  }, [preferences]);
  
  return <>{children}</>;
};

export default AccessibilityStyleProvider; 