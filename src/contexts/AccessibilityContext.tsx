import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useAccessibility, 
  AccessibilityPreferences, 
  LanguageOption, 
  SUPPORTED_LANGUAGES 
} from '../hooks/useAccessibility';

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

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    preferences,
    supportedLanguages,
    setHighContrast,
    setLargeText,
    setReduceMotion,
    setKeyboardFocusVisible,
    setLanguage,
    resetPreferences,
  } = useAccessibility();

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        supportedLanguages,
        setHighContrast,
        setLargeText,
        setReduceMotion,
        setKeyboardFocusVisible,
        setLanguage,
        resetPreferences,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}; 