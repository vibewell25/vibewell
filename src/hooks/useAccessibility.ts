import { useState, useEffect } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  keyboardFocusVisible: boolean;
  language: string;
}

// Define supported languages
export interface LanguageOption {
  code: string;
  name: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', isRTL: false },
  { code: 'es', name: 'Español', isRTL: false },
  { code: 'fr', name: 'Français', isRTL: false },
  { code: 'ar', name: 'العربية', isRTL: true },
  { code: 'he', name: 'עברית', isRTL: true },
  { code: 'ur', name: 'اردو', isRTL: true },
];

const STORAGE_KEY = 'accessibility-preferences';

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    // Get saved preferences from localStorage if available
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem(STORAGE_KEY);
      if (savedPreferences) {
        try {
          return JSON.parse(savedPreferences);
        } catch (error) {
          console.error('Failed to parse accessibility preferences', error);
        }
      }
    }
    
    // Default preferences
    return {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      keyboardFocusVisible: true,
      language: 'en', // Default to English
    };
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
  }, [preferences]);

  // Apply classes to body based on preferences
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      
      // Apply or remove classes based on preferences
      preferences.highContrast 
        ? body.classList.add('high-contrast-theme') 
        : body.classList.remove('high-contrast-theme');
      
      preferences.largeText 
        ? body.classList.add('large-text') 
        : body.classList.remove('large-text');
      
      preferences.reduceMotion 
        ? body.classList.add('reduce-motion') 
        : body.classList.remove('reduce-motion');
      
      preferences.keyboardFocusVisible 
        ? body.classList.add('keyboard-focus-visible') 
        : body.classList.remove('keyboard-focus-visible');
    }
  }, [preferences]);

  // Apply RTL direction based on language selection
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === preferences.language);
      
      if (selectedLanguage?.isRTL) {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', preferences.language);
      } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', preferences.language);
      }
    }
  }, [preferences.language]);

  // Handler functions to update specific preferences
  const setHighContrast = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, highContrast: enabled }));
  };

  const setLargeText = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, largeText: enabled }));
  };

  const setReduceMotion = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, reduceMotion: enabled }));
  };

  const setKeyboardFocusVisible = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, keyboardFocusVisible: enabled }));
  };

  const setLanguage = (languageCode: string) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      setPreferences(prev => ({ ...prev, language: languageCode }));
    }
  };

  // Reset all preferences to defaults
  const resetPreferences = () => {
    setPreferences({
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      keyboardFocusVisible: true,
      language: 'en',
    });
  };

  return {
    preferences,
    supportedLanguages: SUPPORTED_LANGUAGES,
    setHighContrast,
    setLargeText,
    setReduceMotion,
    setKeyboardFocusVisible,
    setLanguage,
    resetPreferences,
  };
}; 