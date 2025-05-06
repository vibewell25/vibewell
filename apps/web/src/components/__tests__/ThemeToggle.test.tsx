/* eslint-disable */import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import * as useLocalStorageModule from '../../hooks/useLocalStorage';

// Mock the useLocalStorage hook
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn().mockReturnValue(['light', jest.fn()]),
}));

describe('ThemeToggle', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  }));

  it('renders with light theme by default', () => {
    // Arrange - Mock hook to return light theme
    jest.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue(['light', jest.fn()]);

    // Act
    render(<ThemeToggle />);

    // Assert
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark theme');
  }));

  it('toggles to dark theme when clicked', () => {
    // Arrange
    const setThemeMock = jest.fn();
    jest.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue(['light', setThemeMock]);
    render(<ThemeToggle />);

    // Act
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Assert
    expect(setThemeMock).toHaveBeenCalledWith(expect.any(Function));
    // The function passed to setTheme should toggle from 'light' to 'dark'
    const toggleFn = setThemeMock.mock.calls[0][0];
    expect(toggleFn('light')).toBe('dark');
  }));

  it('renders with dark theme if localStorage has dark theme', () => {
    // Arrange - Mock hook to return dark theme
    jest.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue(['dark', jest.fn()]);

    // Act
    render(<ThemeToggle />);

    // Assert
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('applies custom className', () => {
    // Arrange & Act
    render(<ThemeToggle className="custom-class" />);

    // Assert
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('custom-class');
    expect(toggleButton).toHaveClass('theme-toggle');
  }));
