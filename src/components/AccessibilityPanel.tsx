import React from 'react';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';

export const AccessibilityPanel: React.FC = () => {
  const {
    preferences,
    supportedLanguages,
    setHighContrast,
    setLargeText,
    setReduceMotion,
    setKeyboardFocusVisible,
    setLanguage,
    resetPreferences,
  } = useAccessibilityContext();

  return (
    <div className="accessibility-panel">
      <h2>Accessibility Settings</h2>
      
      <div className="accessibility-options">
        <div className="option">
          <label htmlFor="language-select">Language / اللغة</label>
          <select 
            id="language-select" 
            value={preferences.language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} {lang.isRTL ? '(RTL)' : ''}
              </option>
            ))}
          </select>
          <p className="description">Select your preferred language</p>
        </div>

        <div className="option">
          <label htmlFor="high-contrast">
            <input
              type="checkbox"
              id="high-contrast"
              checked={preferences.highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            High Contrast
          </label>
          <p className="description">Increases color contrast for better readability</p>
        </div>

        <div className="option">
          <label htmlFor="large-text">
            <input
              type="checkbox"
              id="large-text"
              checked={preferences.largeText}
              onChange={(e) => setLargeText(e.target.checked)}
            />
            Large Text
          </label>
          <p className="description">Increases text size throughout the application</p>
        </div>

        <div className="option">
          <label htmlFor="reduce-motion">
            <input
              type="checkbox"
              id="reduce-motion"
              checked={preferences.reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
            Reduce Motion
          </label>
          <p className="description">Minimizes animations and transitions</p>
        </div>

        <div className="option">
          <label htmlFor="keyboard-focus">
            <input
              type="checkbox"
              id="keyboard-focus"
              checked={preferences.keyboardFocusVisible}
              onChange={(e) => setKeyboardFocusVisible(e.target.checked)}
            />
            Visible Keyboard Focus
          </label>
          <p className="description">Shows a clear indicator when elements are focused via keyboard</p>
        </div>
      </div>

      <button 
        className="reset-button" 
        onClick={resetPreferences}
        aria-label="Reset all accessibility settings to defaults"
      >
        Reset to Defaults
      </button>
    </div>
  );
}; 