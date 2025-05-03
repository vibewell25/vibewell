import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility, AccessibilityPreferences, LanguageOption } from '../hooks/use-accessibility';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  supportedLanguages: LanguageOption[];
  setHighContrast: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setKeyboardFocusVisible: (enabled: boolean) => void;
  setLanguage: (languageCode: string) => void;
  resetPreferences: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export {};

export {};
