import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * SkipLink - Provides a way for keyboard users to skip navigation and go directly to main content
 *
 * This component is typically placed at the very beginning of the page markup. It remains
 * visually hidden until focused, at which point it becomes visible and allows users to
 * skip directly to the main content, improving accessibility for keyboard and screen reader users.
 *
 * Usage:
 * ```tsx
 * // Place at the top of your layout
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 *
 * // Then make sure to add the corresponding ID to your main content
 * <main id="main-content">...</main>
 * ```
 */
export function SkipLink({ href, className, children = 'Skip to content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Base styles - always present
        'text-primary absolute left-0 top-0 z-50 rounded bg-white px-4 py-3 text-sm font-medium transition',
        // Visually hidden by default
        '-translate-y-full opacity-0',
        // Visible when focused - slides into view from the top
        'focus:outline-primary focus:translate-y-0 focus:opacity-100 focus:outline-2 focus:outline-offset-2',
        // Elevation when focused
        'focus:shadow-lg',
        // High contrast mode support
        'focus:ring-primary focus:ring-2 focus:ring-offset-2',
        className,
      )}
      onKeyDown={(e) => {
        // When user presses Enter, focus the element with the target ID
        if (e.key === 'Enter') {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            (targetElement as HTMLElement).focus();
            // Add tabindex=-1 if not present to make it focusable
            if (!(targetElement as HTMLElement).hasAttribute('tabindex')) {
              (targetElement as HTMLElement).setAttribute('tabindex', '-1');
            }
          }
        }
      }}
      // Automatically test with screen readers
      data-testid="skip-link"
      aria-label="Skip to main content"
    >
      {children}
    </a>
  );
}

/**
 * Make sure to add these styles in your global CSS or layout component:
 *
 * ```css
 * #main-content:focus {
 *   outline: none; // Remove visible outline on content
 * }
 * ```
 *
 * And mark sections properly:
 *
 * ```tsx
 * <header>...</header>
 * <main id="main-content" tabIndex={-1}>...</main>
 * ```
 */
export default SkipLink;
