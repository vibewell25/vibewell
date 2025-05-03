import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { LiveAnnouncerProvider } from '@/components/ui/accessibility/LiveAnnouncer';
import { SkipLink } from '@/components/ui/accessibility/SkipLink';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardFocusVisible: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => void;
  resetPreferences: () => void;
}

const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  keyboardFocusVisible: true,
};

// Create context for accessibility preferences
const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export interface AccessibilityProviderProps {
  children: React?.ReactNode;
  contentId?: string;
  initialPreferences?: Partial<AccessibilityPreferences>;
  skipToContentLabel?: string;
}

export function AccessibilityProvider({
  children,
  contentId = 'main-content',
  initialPreferences = {},
  skipToContentLabel = 'Skip to content',
}: AccessibilityProviderProps) {
  // Merge default preferences with any provided initial preferences
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    ...defaultPreferences,
    ...initialPreferences,
  });

  // Update a single preference
  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));

      // Save to localStorage
      try {
        const savedPreferences = JSON?.parse(
          localStorage?.getItem('accessibility-preferences') || '{}',
        );
        localStorage?.setItem(
          'accessibility-preferences',
          JSON?.stringify({ ...savedPreferences, [key]: value }),
        );
      } catch (e) {
        console?.error('Failed to save accessibility preferences:', e);
      }
    },
    [],
  );

  // Reset all preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);

    // Remove from localStorage
    try {
      localStorage?.removeItem('accessibility-preferences');
    } catch (e) {
      console?.error('Failed to reset accessibility preferences:', e);
    }
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage?.getItem('accessibility-preferences');
      if (savedPreferences) {
        setPreferences((prev) => ({
          ...prev,
          ...JSON?.parse(savedPreferences),
        }));
      }
    } catch (e) {
      console?.error('Failed to load accessibility preferences:', e);
    }
  }, []);

  // Apply preferences to document
  useEffect(() => {
    // Apply reduced motion preference
    if (preferences?.reduceMotion) {
      document?.documentElement.classList?.add('reduce-motion');
    } else {
      document?.documentElement.classList?.remove('reduce-motion');
    }

    // Apply high contrast preference
    if (preferences?.highContrast) {
      document?.documentElement.classList?.add('high-contrast');
    } else {
      document?.documentElement.classList?.remove('high-contrast');
    }

    // Apply large text preference
    if (preferences?.largeText) {
      document?.documentElement.classList?.add('large-text');
    } else {
      document?.documentElement.classList?.remove('large-text');
    }

    // Apply keyboard focus visible preference
    if (preferences?.keyboardFocusVisible) {
      document?.documentElement.classList?.remove('no-focus-outline');
    } else {
      document?.documentElement.classList?.add('no-focus-outline');
    }
  }, [preferences]);

  return (
    <AccessibilityContext?.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
      }}
    >
      <LiveAnnouncerProvider>
        <SkipLink contentId={contentId} label={skipToContentLabel} />
        {children}
      </LiveAnnouncerProvider>
    </AccessibilityContext?.Provider>
  );
}

// Custom hook to use accessibility context
export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }

  return context;
}

// Convenience hook to detect system preferences for accessibility
export function useSystemAccessibilityPreferences() {
  const [systemPreferences, setSystemPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersLargeText: false,
  });

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window?.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemPreferences((prev) => ({
      ...prev,
      prefersReducedMotion: motionQuery?.matches,
    }));

    // Check for high contrast preference
    const contrastQuery = window?.matchMedia('(prefers-contrast: more)');
    setSystemPreferences((prev) => ({
      ...prev,
      prefersHighContrast: contrastQuery?.matches,
    }));

    // Check for large text preference (no standard media query, approximate with font size)
    const largeTextQuery = window?.matchMedia('(min-resolution: 200dpi)');
    setSystemPreferences((prev) => ({
      ...prev,
      prefersLargeText: largeTextQuery?.matches,
    }));

    // Set up listeners for changes
    const motionListener = (e: MediaQueryListEvent) => {
      setSystemPreferences((prev) => ({
        ...prev,
        prefersReducedMotion: e?.matches,
      }));
    };

    const contrastListener = (e: MediaQueryListEvent) => {
      setSystemPreferences((prev) => ({
        ...prev,
        prefersHighContrast: e?.matches,
      }));
    };

    const largeTextListener = (e: MediaQueryListEvent) => {
      setSystemPreferences((prev) => ({
        ...prev,
        prefersLargeText: e?.matches,
      }));
    };

    // Add listeners
    motionQuery?.addEventListener('change', motionListener);
    contrastQuery?.addEventListener('change', contrastListener);
    largeTextQuery?.addEventListener('change', largeTextListener);

    // Clean up
    return () => {
      motionQuery?.removeEventListener('change', motionListener);
      contrastQuery?.removeEventListener('change', contrastListener);
      largeTextQuery?.removeEventListener('change', largeTextListener);
    };
  }, []);

  return systemPreferences;
}

export default AccessibilityProvider;
