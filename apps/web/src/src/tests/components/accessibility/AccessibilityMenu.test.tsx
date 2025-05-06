/* eslint-disable */import { render, screen, fireEvent, act } from '@testing-library/react';
import AccessibilityMenu from '@/components/ui/accessibility/AccessibilityMenu';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mock the useLocalStorage hook
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}}}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}}}));

describe('AccessibilityMenu', () => {
  // Setup mock for localStorage
  const mockSetSettings = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock the localStorage hook
    (useLocalStorage as jest.Mock).mockReturnValue([
      {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        textToSpeech: false,
        dyslexicFont: false,
        lineHeight: 'normal',
        keyboardMode: false,
        textSpacing: false,
      },
      mockSetSettings,
    ]);

    // Mock classList functions
    document.documentElement.classList.add = jest.fn();
    document.documentElement.classList.remove = jest.fn();
  }}}));

  test('renders accessibility button', () => {
    render(<AccessibilityMenu />);

    const accessibilityButton = screen.getByRole('button', {
      name: /accessibility menu/i,
    }}));

    expect(accessibilityButton).toBeInTheDocument();
  }});

  test('opens menu when button is clicked', async () => {
    render(<AccessibilityMenu />);

    // Click the button to open the menu
    const accessibilityButton = screen.getByRole('button', {
      name: /accessibility menu/i,
    });

    act(() => {
      fireEvent.click(accessibilityButton);
    });

    // Check if the menu is open
    const heading = screen.getByText(/accessibility options/i);
    expect(heading).toBeInTheDocument();
  });

  test('toggles high contrast mode', async () => {
    render(<AccessibilityMenu />);

    // Open the menu
    const accessibilityButton = screen.getByRole('button', {
      name: /accessibility menu/i,
    });

    act(() => {
      fireEvent.click(accessibilityButton);
    });

    // Find and click the high contrast toggle
    const highContrastLabel = screen.getByText(/high contrast/i);
    const highContrastButton = highContrastLabel.nextElementSibling as HTMLElement;

    act(() => {
      fireEvent.click(highContrastButton);
    });

    // Expect the setter function to be called with updated settings
    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        highContrast: true,
      }),

  });

  test('toggles large text mode', async () => {
    render(<AccessibilityMenu />);

    // Open the menu
    const accessibilityButton = screen.getByRole('button', {
      name: /accessibility menu/i,
    });

    act(() => {
      fireEvent.click(accessibilityButton);
    });

    // Find and click the large text toggle
    const largeTextLabel = screen.getByText(/large text/i);
    const largeTextButton = largeTextLabel.nextElementSibling as HTMLElement;

    act(() => {
      fireEvent.click(largeTextButton);
    });

    // Expect the setter function to be called with updated settings
    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        largeText: true,
      }),

  });

  test('cycles through line height options', async () => {
    render(<AccessibilityMenu />);

    // Open the menu
    const accessibilityButton = screen.getByRole('button', {
      name: /accessibility menu/i,
    });

    act(() => {
      fireEvent.click(accessibilityButton);
    });

    // Find and click the line height button
    const lineHeightButton = screen.getByText(/normal/i);

    act(() => {
      fireEvent.click(lineHeightButton);
    });

    // Expect the setter function to be called with updated settings
    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        lineHeight: 'increased',
      }),

  });

  test('resets all settings when reset button is clicked', async () => {
    render(<AccessibilityMenu />);

    // Open the menu
    const accessibilityButton = screen.getByRole('button', {
      name: /accessibility menu/i,
    });

    act(() => {
      fireEvent.click(accessibilityButton);
    });

    // Find and click the reset button
    const resetButton = screen.getByText(/reset all settings/i);

    act(() => {
      fireEvent.click(resetButton);
    });

    // Expect the setter function to be called with default settings
    expect(mockSetSettings).toHaveBeenCalledWith({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      textToSpeech: false,
      dyslexicFont: false,
      lineHeight: 'normal',
      keyboardMode: false,
      textSpacing: false,
    }});

  test('applies classes to document when settings change', () => {
    // Mock settings with highContrast enabled
    (useLocalStorage as jest.Mock).mockReturnValue([
      {
        highContrast: true,
        largeText: false,
        reducedMotion: false,
        textToSpeech: false,
        dyslexicFont: false,
        lineHeight: 'normal',
        keyboardMode: false,
        textSpacing: false,
      },
      mockSetSettings,
    ]);

    render(<AccessibilityMenu />);

    // Check if the high-contrast class was added to document
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('high-contrast');
  }});
