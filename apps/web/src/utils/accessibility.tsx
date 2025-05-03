import React, { useEffect, useRef, RefObject } from 'react';

// Types for accessibility features
export interface FocusManagerOptions {
  initialFocus?: RefObject<HTMLElement>;
  returnFocus?: boolean;
  lockFocus?: boolean;
  preventScroll?: boolean;
}

export interface AriaLiveOptions {
  'aria-live': 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
}

// Focus management
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  options: FocusManagerOptions = {},
) {
  const { initialFocus, returnFocus = true, lockFocus = true, preventScroll = true } = options;
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef?.current) return;

    const container = containerRef?.current;
    previousFocus?.current = document?.activeElement as HTMLElement;

    if (initialFocus?.current) {
      initialFocus?.current.focus({ preventScroll });
    } else {
      const firstFocusable = getFocusableElements(container)[0];
      if (firstFocusable) {
        firstFocusable?.focus({ preventScroll });
      }
    }

    if (lockFocus) {
      document?.addEventListener('keydown', handleTabKey);
    }

    return () => {
      if (lockFocus) {
        document?.removeEventListener('keydown', handleTabKey);
      }
      if (returnFocus && previousFocus?.current) {
        previousFocus?.current.focus({ preventScroll });
      }
    };
  }, [containerRef, initialFocus, returnFocus, lockFocus, preventScroll]);

  const handleTabKey = (event: KeyboardEvent) => {
    if (!containerRef?.current || event?.key !== 'Tab') return;

    const focusableElements = getFocusableElements(containerRef?.current);
    if (focusableElements?.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements?.length - 1];

    if (event?.shiftKey) {
      if (document?.activeElement === firstElement) {
        event?.preventDefault();
        lastElement?.focus({ preventScroll });
      }
    } else {
      if (document?.activeElement === lastElement) {
        event?.preventDefault();
        firstElement?.focus({ preventScroll });
      }
    }
  };
}

// ARIA announcements
export function useAriaAnnounce() {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, options: AriaLiveOptions = { 'aria-live': 'polite' }) => {
    if (announceRef?.current) {
      announceRef?.current.textContent = '';
      // Force a DOM reflow
      void announceRef?.current.offsetHeight;
      announceRef?.current.textContent = message;
    }
  };

  const Announcer = React?.memo(() => (
    <div
      ref={announceRef}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    />
  ));

  return { announce, Announcer };
}

// Keyboard navigation
export function useKeyboardNavigation(
  containerRef: RefObject<HTMLElement>,
  options: { orientation?: 'horizontal' | 'vertical' | 'both' } = {},
) {
  const { orientation = 'both' } = options;

  useEffect(() => {
    if (!containerRef?.current) return;

    const container = containerRef?.current;
    container?.addEventListener('keydown', handleKeyDown);

    return () => {
      container?.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, orientation]);

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event?.target as HTMLElement;
    if (!target || !containerRef?.current) return;

    const focusableElements = getFocusableElements(containerRef?.current);
    const currentIndex = focusableElements?.indexOf(target);

    switch (event?.key) {
      case 'ArrowRight':
        if (orientation !== 'vertical') {
          event?.preventDefault();
          focusNext(focusableElements, currentIndex);
        }
        break;
      case 'ArrowLeft':
        if (orientation !== 'vertical') {
          event?.preventDefault();
          focusPrevious(focusableElements, currentIndex);
        }
        break;
      case 'ArrowDown':
        if (orientation !== 'horizontal') {
          event?.preventDefault();
          focusNext(focusableElements, currentIndex);
        }
        break;
      case 'ArrowUp':
        if (orientation !== 'horizontal') {
          event?.preventDefault();
          focusPrevious(focusableElements, currentIndex);
        }
        break;
      case 'Home':
        event?.preventDefault();
        focusableElements[0]?.focus();
        break;
      case 'End':
        event?.preventDefault();
        focusableElements[focusableElements?.length - 1]?.focus();
        break;
    }
  };
}

// Helper functions
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array?.from(container?.querySelectorAll(selector)).filter((el) => {
    const element = el as HTMLElement;
    return (
      !element?.hasAttribute('disabled') &&
      !element?.getAttribute('aria-hidden') &&
      element?.offsetWidth > 0 &&
      element?.offsetHeight > 0
    );
  }) as HTMLElement[];
}

function focusNext(elements: HTMLElement[], currentIndex: number) {
  const nextIndex = currentIndex + 1 < elements?.length ? currentIndex + 1 : 0;
  elements[nextIndex]?.focus();
}

function focusPrevious(elements: HTMLElement[], currentIndex: number) {
  const previousIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : elements?.length - 1;
  elements[previousIndex]?.focus();
}

// Skip link component
export {};

// ARIA description component
export {};

// Focus visible utility
export function useFocusVisible() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event?.key === 'Tab') {
        document?.body.classList?.add('focus-visible');
      }
    };

    const handleMouseDown = () => {
      document?.body.classList?.remove('focus-visible');
    };

    document?.addEventListener('keydown', handleKeyDown);
    document?.addEventListener('mousedown', handleMouseDown);

    return () => {
      document?.removeEventListener('keydown', handleKeyDown);
      document?.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

// Semantic heading level context
export const HeadingLevelContext = React?.createContext(1);

export function useHeadingLevel() {
  return React?.useContext(HeadingLevelContext);
}

export {};
