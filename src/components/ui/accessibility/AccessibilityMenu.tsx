import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';

// Accessibility settings interface
interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
  dyslexicFont: boolean;
  lineHeight: 'normal' | 'increased' | 'large';
  keyboardMode: boolean;
  textSpacing: boolean;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  textToSpeech: false,
  dyslexicFont: false,
  lineHeight: 'normal',
  keyboardMode: false,
  textSpacing: false,
};

const AccessibilityMenu: React.FC = () => {
  // State for menu open/closed
  const [isOpen, setIsOpen] = useState(false);

  // Get accessibility settings from local storage
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    'accessibility-settings',
    defaultSettings,
  );

  // Apply accessibility settings to document
  useEffect(() => {
    // High contrast mode
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Dyslexic font
    if (settings.dyslexicFont) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }

    // Line height
    document.documentElement.classList.remove(
      'line-height-normal',
      'line-height-increased',
      'line-height-large',
    );
    document.documentElement.classList.add(`line-height-${settings.lineHeight}`);

    // Keyboard mode
    if (settings.keyboardMode) {
      document.documentElement.classList.add('keyboard-mode');
    } else {
      document.documentElement.classList.remove('keyboard-mode');
    }

    // Text spacing
    if (settings.textSpacing) {
      document.documentElement.classList.add('text-spacing');
    } else {
      document.documentElement.classList.remove('text-spacing');
    }
  }, [settings]);

  // Handle setting toggle
  const toggleSetting = (key: keyof AccessibilitySettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  // Handle line height change
  const changeLineHeight = () => {
    const heights: Array<AccessibilitySettings['lineHeight']> = ['normal', 'increased', 'large'];
    const currentIndex = heights.indexOf(settings.lineHeight);
    const nextIndex = (currentIndex + 1) % heights.length;

    setSettings({
      ...settings,
      lineHeight: heights[nextIndex],
    });
  };

  // Reset all settings
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Toggle text-to-speech
  const toggleTextToSpeech = () => {
    const newValue = !settings.textToSpeech;
    setSettings({
      ...settings,
      textToSpeech: newValue,
    });

    if (newValue && 'speechSynthesis' in window) {
      // Initialize speech synthesis if not already initialized
      const msg = new SpeechSynthesisUtterance('Text to speech enabled');
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="accessibility-widget fixed bottom-4 right-4 z-50">
      {/* Accessibility button */}
      <button
        className="accessibility-toggle rounded-full bg-blue-600 p-3 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Accessibility menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>
      </button>

      {/* Accessibility menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="accessibility-menu absolute bottom-16 right-0 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Accessibility Options
            </h2>

            <div className="space-y-4">
              {/* High Contrast Mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">High Contrast</label>
                <button
                  onClick={() => toggleSetting('highContrast')}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.highContrast}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.highContrast ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Large Text</label>
                <button
                  onClick={() => toggleSetting('largeText')}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.largeText ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.largeText}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.largeText ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Reduced Motion</label>
                <button
                  onClick={() => toggleSetting('reducedMotion')}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.reducedMotion}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.reducedMotion ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Text to Speech */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Text to Speech</label>
                <button
                  onClick={toggleTextToSpeech}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.textToSpeech ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.textToSpeech}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.textToSpeech ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Dyslexic Font */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Dyslexic Font</label>
                <button
                  onClick={() => toggleSetting('dyslexicFont')}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.dyslexicFont ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.dyslexicFont}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.dyslexicFont ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Line Height */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Line Height</label>
                <button
                  onClick={changeLineHeight}
                  className="rounded bg-gray-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  {settings.lineHeight === 'normal'
                    ? 'Normal'
                    : settings.lineHeight === 'increased'
                      ? 'Medium'
                      : 'Large'}
                </button>
              </div>

              {/* Keyboard Mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Keyboard Mode</label>
                <button
                  onClick={() => toggleSetting('keyboardMode')}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.keyboardMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.keyboardMode}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.keyboardMode ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Text Spacing */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Text Spacing</label>
                <button
                  onClick={() => toggleSetting('textSpacing')}
                  className={`h-6 w-10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.textSpacing ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-pressed={settings.textSpacing}
                >
                  <span
                    className={`block h-4 w-4 transform rounded-full transition-transform duration-200 ${settings.textSpacing ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'}`}
                  />
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetSettings}
                className="mt-4 w-full rounded bg-gray-200 px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Reset All Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessibilityMenu;
