import { render, screen, fireEvent, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibilityContext } from '../AccessibilityContext';
import { LanguageOption } from '../../hooks/useAccessibility';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Simple test component
const RTLTestComponent = () => {
  const { preferences, setLanguage, supportedLanguages } = useAccessibilityContext();

  // Find the current language from the supported languages
  const currentLanguageObj = supportedLanguages.find(
    (lang: LanguageOption) => lang.code === preferences.language,
  );

  // Determine if the language is RTL (default to false if not found)
  const isRTL = Boolean(currentLanguageObj && currentLanguageObj.isRTL);

  return (
    <div data-testid="rtl-test-component">
      <div data-testid="current-language">{preferences.language}</div>
      <div data-testid="is-rtl">{isRTL ? 'RTL' : 'LTR'}</div>

      <select
        data-testid="language-selector"
        value={preferences.language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {supportedLanguages.map((lang: LanguageOption) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

describe('RTL Support', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('sets default language to English (LTR)', () => {
    render(
      <AccessibilityProvider>
        <RTLTestComponent />
      </AccessibilityProvider>,
    );

    expect(screen.getByTestId('current-language').textContent).toBe('en');
    expect(screen.getByTestId('is-rtl').textContent).toBe('LTR');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('changes to RTL when Arabic is selected', () => {
    render(
      <AccessibilityProvider>
        <RTLTestComponent />
      </AccessibilityProvider>,
    );

    // Initial state should be LTR
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    // Change to Arabic (RTL language)
    act(() => {
      const select = screen.getByTestId('language-selector');
      fireEvent.change(select, { target: { value: 'ar' } });
    });

    // Check if RTL is applied
    expect(screen.getByTestId('current-language').textContent).toBe('ar');
    expect(screen.getByTestId('is-rtl').textContent).toBe('RTL');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('changes from RTL to LTR when language changes', () => {
    // Start with Arabic
    render(
      <AccessibilityProvider>
        <RTLTestComponent />
      </AccessibilityProvider>,
    );

    // Change to Arabic first
    act(() => {
      const select = screen.getByTestId('language-selector');
      fireEvent.change(select, { target: { value: 'ar' } });
    });

    // Verify RTL is applied
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');

    // Change back to English
    act(() => {
      const select = screen.getByTestId('language-selector');
      fireEvent.change(select, { target: { value: 'en' } });
    });

    // Check if LTR is applied again
    expect(screen.getByTestId('current-language').textContent).toBe('en');
    expect(screen.getByTestId('is-rtl').textContent).toBe('LTR');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('persists language preference in localStorage', () => {
    render(
      <AccessibilityProvider>
        <RTLTestComponent />
      </AccessibilityProvider>,
    );

    // Change to Arabic
    act(() => {
      const select = screen.getByTestId('language-selector');
      fireEvent.change(select, { target: { value: 'ar' } });
    });

    // Check if localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'accessibility-preferences',
      expect.any(String),
    );

    const savedPrefs = JSON.parse(
      mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1],
    );

    expect(savedPrefs.language).toBe('ar');
  });

  it('loads RTL language preference from localStorage', () => {
    // Set up localStorage with Arabic language
    mockLocalStorage.setItem(
      'accessibility-preferences',
      JSON.stringify({
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        keyboardFocusVisible: true,
        language: 'ar',
      }),
    );

    render(
      <AccessibilityProvider>
        <RTLTestComponent />
      </AccessibilityProvider>,
    );

    // Should load Arabic and apply RTL
    expect(screen.getByTestId('current-language').textContent).toBe('ar');
    expect(screen.getByTestId('is-rtl').textContent).toBe('RTL');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('resets to English when preferences are reset', () => {
    // Start with Arabic
    mockLocalStorage.setItem(
      'accessibility-preferences',
      JSON.stringify({
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        keyboardFocusVisible: true,
        language: 'ar',
      }),
    );

    const ResetButton = () => {
      const { resetPreferences } = useAccessibilityContext();
      return (
        <button data-testid="reset-button" onClick={resetPreferences}>
          Reset
        </button>
      );
    };

    render(
      <AccessibilityProvider>
        <RTLTestComponent />
        <ResetButton />
      </AccessibilityProvider>,
    );

    // Verify initially RTL
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');

    // Reset preferences
    act(() => {
      fireEvent.click(screen.getByTestId('reset-button'));
    });

    // Should return to LTR English
    expect(screen.getByTestId('current-language').textContent).toBe('en');
    expect(screen.getByTestId('is-rtl').textContent).toBe('LTR');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });
});
