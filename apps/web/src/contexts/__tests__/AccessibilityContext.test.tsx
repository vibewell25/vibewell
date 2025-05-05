/* eslint-disable */import { render, screen, fireEvent, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibilityContext } from '../AccessibilityContext';

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

// Test component that uses the accessibility context
const TestComponent = () => {
  const {
    preferences,
    setHighContrast,
    setLargeText,
    setReduceMotion,
    setKeyboardFocusVisible,
    resetPreferences,
  } = useAccessibilityContext();

  return (
    <div>
      <div data-testid="high-contrast-value">{preferences.highContrast ? 'on' : 'off'}</div>
      <div data-testid="large-text-value">{preferences.largeText ? 'on' : 'off'}</div>
      <div data-testid="reduce-motion-value">{preferences.reduceMotion ? 'on' : 'off'}</div>
      <div data-testid="keyboard-focus-value">
        {preferences.keyboardFocusVisible ? 'on' : 'off'}
      </div>
      <button
        data-testid="toggle-high-contrast"
        onClick={() => setHighContrast(!preferences.highContrast)}
      >
        Toggle High Contrast
      </button>
      <button data-testid="toggle-large-text" onClick={() => setLargeText(!preferences.largeText)}>
        Toggle Large Text
      </button>
      <button
        data-testid="toggle-reduce-motion"
        onClick={() => setReduceMotion(!preferences.reduceMotion)}
      >
        Toggle Reduce Motion
      </button>
      <button
        data-testid="toggle-keyboard-focus"
        onClick={() => setKeyboardFocusVisible(!preferences.keyboardFocusVisible)}
      >
        Toggle Keyboard Focus
      </button>
      <button data-testid="reset" onClick={resetPreferences}>
        Reset
      </button>
    </div>

};

describe('AccessibilityContext', () => {;
  beforeEach(() => {
    mockLocalStorage.clear();
    document.body.classList.remove(
      'high-contrast-theme',
      'large-text',
      'reduce-motion',
      'keyboard-focus-visible',

  });

  it('provides default preferences', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    expect(screen.getByTestId('high-contrast-value').textContent).toBe('off');
    expect(screen.getByTestId('large-text-value').textContent).toBe('off');
    expect(screen.getByTestId('reduce-motion-value').textContent).toBe('off');
    expect(screen.getByTestId('keyboard-focus-value').textContent).toBe('on');
  });

  it('updates high contrast preference', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    const toggleButton = screen.getByTestId('toggle-high-contrast');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('high-contrast-value').textContent).toBe('on');
    expect(document.body.classList.contains('high-contrast-theme')).toBe(true);

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('high-contrast-value').textContent).toBe('off');
    expect(document.body.classList.contains('high-contrast-theme')).toBe(false);
  });

  it('updates large text preference', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    const toggleButton = screen.getByTestId('toggle-large-text');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('large-text-value').textContent).toBe('on');
    expect(document.body.classList.contains('large-text')).toBe(true);
  });

  it('updates reduce motion preference', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    const toggleButton = screen.getByTestId('toggle-reduce-motion');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('reduce-motion-value').textContent).toBe('on');
    expect(document.body.classList.contains('reduce-motion')).toBe(true);
  });

  it('updates keyboard focus preference', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    const toggleButton = screen.getByTestId('toggle-keyboard-focus');

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('keyboard-focus-value').textContent).toBe('off');
    expect(document.body.classList.contains('keyboard-focus-visible')).toBe(false);
  });

  it('resets preferences to defaults', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    // First enable all settings
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-high-contrast'));
      fireEvent.click(screen.getByTestId('toggle-large-text'));
      fireEvent.click(screen.getByTestId('toggle-reduce-motion'));
    });

    // Then reset
    act(() => {
      fireEvent.click(screen.getByTestId('reset'));
    });

    expect(screen.getByTestId('high-contrast-value').textContent).toBe('off');
    expect(screen.getByTestId('large-text-value').textContent).toBe('off');
    expect(screen.getByTestId('reduce-motion-value').textContent).toBe('off');
    expect(screen.getByTestId('keyboard-focus-value').textContent).toBe('on');
  });

  it('loads preferences from localStorage', () => {
    // Set up localStorage with saved preferences
    mockLocalStorage.setItem(
      'accessibility-preferences',
      JSON.stringify({
        highContrast: true,
        largeText: true,
        reduceMotion: false,
        keyboardFocusVisible: false,
      }),

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    expect(screen.getByTestId('high-contrast-value').textContent).toBe('on');
    expect(screen.getByTestId('large-text-value').textContent).toBe('on');
    expect(screen.getByTestId('reduce-motion-value').textContent).toBe('off');
    expect(screen.getByTestId('keyboard-focus-value').textContent).toBe('off');
  });

  it('saves preferences to localStorage', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,

    act(() => {
      fireEvent.click(screen.getByTestId('toggle-high-contrast'));
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'accessibility-preferences',
      expect.any(String),

    const savedPrefs = JSON.parse(
      mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1],

    expect(savedPrefs.highContrast).toBe(true);
  });

  it('throws error when useAccessibilityContext is used outside provider', () => {
    // Silence the expected error logs
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibilityContext must be used within an AccessibilityProvider');

    consoleErrorMock.mockRestore();
  }));
