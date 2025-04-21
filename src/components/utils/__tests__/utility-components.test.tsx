import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import {
  ThemeToggle,
  ScrollToTop,
  DateFormatter,
  CopyToClipboard,
  ImageOptimizer,
  useTheme,
} from '../';

// Mock window methods
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', { value: mockScrollTo });

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn() },
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Utility Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ThemeToggle', () => {
    it('renders theme toggle button', () => {
      render(<ThemeToggle />);
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });

    it('switches between light and dark themes', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme();
        return (
          <div>
            <span>Current theme: {theme}</span>
            <ThemeToggle onToggle={toggleTheme} />
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText('Current theme: light')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /toggle theme/i }));
      expect(screen.getByText('Current theme: dark')).toBeInTheDocument();
    });

    it('persists theme preference', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      render(<ThemeToggle />);
      await user.click(screen.getByRole('button', { name: /toggle theme/i }));

      expect(setItemSpy).toHaveBeenCalledWith('theme-preference', 'dark');
      setItemSpy.mockRestore();
    });

    it('respects system preference', () => {
      const matchMediaSpy = vi.spyOn(window, 'matchMedia');
      matchMediaSpy.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      render(<ThemeToggle useSystemTheme />);
      expect(screen.getByText(/system theme/i)).toBeInTheDocument();

      matchMediaSpy.mockRestore();
    });
  });

  describe('ScrollToTop', () => {
    it('renders scroll button when page is scrolled', async () => {
      render(<ScrollToTop threshold={100} />);

      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 200 } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
      });
    });

    it('scrolls to top when clicked', async () => {
      render(<ScrollToTop />);
      fireEvent.scroll(window, { target: { scrollY: 200 } });

      await user.click(screen.getByRole('button', { name: /scroll to top/i }));
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('hides when below threshold', async () => {
      render(<ScrollToTop threshold={100} />);

      fireEvent.scroll(window, { target: { scrollY: 50 } });

      expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
    });

    it('supports custom scroll behavior', async () => {
      render(<ScrollToTop behavior="auto" />);
      fireEvent.scroll(window, { target: { scrollY: 200 } });

      await user.click(screen.getByRole('button', { name: /scroll to top/i }));
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    });
  });

  describe('DateFormatter', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');

    it('formats date in different styles', () => {
      const { rerender } = render(<DateFormatter date={testDate} format="short" />);
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();

      rerender(<DateFormatter date={testDate} format="long" />);
      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();

      rerender(<DateFormatter date={testDate} format="relative" />);
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });

    it('handles invalid dates', () => {
      render(<DateFormatter date={new Date('invalid')} />);
      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('updates relative time automatically', async () => {
      vi.useFakeTimers();
      render(<DateFormatter date={new Date()} format="relative" updateInterval={1000} />);

      expect(screen.getByText('just now')).toBeInTheDocument();

      vi.advanceTimersByTime(61000);
      expect(screen.getByText('1 minute ago')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('supports custom format patterns', () => {
      render(<DateFormatter date={testDate} format="custom" pattern="MMMM do, yyyy 'at' h:mm a" />);
      expect(screen.getByText('January 15th, 2024 at 12:00 PM')).toBeInTheDocument();
    });
  });

  describe('CopyToClipboard', () => {
    it('copies text to clipboard', async () => {
      render(
        <CopyToClipboard text="Test text">
          <button>Copy</button>
        </CopyToClipboard>
      );

      await user.click(screen.getByText('Copy'));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
    });

    it('shows success feedback', async () => {
      render(
        <CopyToClipboard text="Test text" showFeedback>
          <button>Copy</button>
        </CopyToClipboard>
      );

      await user.click(screen.getByText('Copy'));
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });

    it('handles copy errors', async () => {
      const mockClipboard = { writeText: vi.fn().mockRejectedValue(new Error('Copy failed')) };
      Object.defineProperty(navigator, 'clipboard', { value: mockClipboard });

      render(
        <CopyToClipboard text="Test text" showFeedback>
          <button>Copy</button>
        </CopyToClipboard>
      );

      await user.click(screen.getByText('Copy'));
      expect(screen.getByText(/failed to copy/i)).toBeInTheDocument();
    });
  });

  describe('ImageOptimizer', () => {
    const testImage = {
      src: '/test-image.jpg',
      alt: 'Test image',
      width: 800,
      height: 600,
    };

    it('renders optimized image', () => {
      render(<ImageOptimizer {...testImage} />);
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('srcset');
    });

    it('applies blur placeholder', () => {
      render(<ImageOptimizer {...testImage} placeholder="blur" />);
      expect(screen.getByAltText('Test image')).toHaveStyle({
        filter: 'blur(20px)',
      });
    });

    it('handles loading states', async () => {
      render(<ImageOptimizer {...testImage} showLoadingState />);
      expect(screen.getByTestId('image-skeleton')).toBeInTheDocument();

      // Simulate image load
      fireEvent.load(screen.getByAltText('Test image'));
      expect(screen.queryByTestId('image-skeleton')).not.toBeInTheDocument();
    });

    it('handles error states', async () => {
      render(<ImageOptimizer {...testImage} showErrorState />);

      fireEvent.error(screen.getByAltText('Test image'));
      expect(screen.getByText(/failed to load image/i)).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('ThemeToggle meets accessibility standards', async () => {
      const { container } = render(<ThemeToggle />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ScrollToTop meets accessibility standards', async () => {
      const { container } = render(<ScrollToTop />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DateFormatter meets accessibility standards', async () => {
      const { container } = render(<DateFormatter date={new Date()} format="long" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('CopyToClipboard meets accessibility standards', async () => {
      const { container } = render(
        <CopyToClipboard text="Test text">
          <button>Copy</button>
        </CopyToClipboard>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ImageOptimizer meets accessibility standards', async () => {
      const { container } = render(
        <ImageOptimizer src="/test-image.jpg" alt="Test image" width={800} height={600} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
