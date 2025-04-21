'use client';

import React from 'react';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AccessibilityStyleProvider } from '@/components/accessibility/AccessibilityProvider';

interface LayoutProvidersProps {
  children: React.ReactNode;
}

export function LayoutProviders({ children }: LayoutProvidersProps) {
  return (
    <AccessibilityProvider>
      <AccessibilityStyleProvider>
        {children}
      </AccessibilityStyleProvider>
    </AccessibilityProvider>
  );
} 