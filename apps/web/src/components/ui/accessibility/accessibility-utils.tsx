'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Accessibility utilities for common patterns
 */

/**
 * Hook to manage focus when a component mounts/unmounts
 */
export function useFocusOnMount<T extends HTMLElement>(shouldFocus = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus]);

  return ref;
}

/**
 * Hook to trap focus within a container
 */
export function useFocusTrap<T extends HTMLElement>(active = true) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return containerRef;
}

/**
 * Hook to handle keyboard interactions
 */
export function useKeyboardInteraction(
  onEnter?: () => void,
  onEscape?: () => void,
  onSpace?: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          onEnter.();
          break;
        case 'Escape':
          onEscape.();
          break;
        case ' ':
          onSpace.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onSpace]);
}

/**
 * Component to provide ARIA live region for dynamic content
 */
export function LiveRegion({
  children,
  politeness = 'polite',
}: {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {children}
    </div>
  );
}

/**
 * Component to provide accessible error messages
 */
export function ErrorMessage({ id, error }: { id: string; error?: string }) {
  if (!error) return null;

  return (
    <div id={`${id}-error`} className="mt-1 text-sm text-red-500" role="alert">
      {error}
    </div>
  );
}

/**
 * Component to provide accessible loading states
 */
export function LoadingState({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div aria-busy={isLoading} aria-live="polite">
      {isLoading ? <div className="sr-only">Loading...</div> : children}
    </div>
  );
}

/**
 * Component to provide accessible tooltips
 */
export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div
        role="tooltip"
        className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
      >
        {content}
      </div>
    </div>
  );
}
