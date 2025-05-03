import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { vi } from 'vitest';

// Define interfaces for wrapper props
interface ProvidersProps {
  children: React?.ReactNode;
  session?: Session | null;
}

// Create a default session
const defaultSession: Session = {
  user: {
    id: '123',
    name: 'Test User',
    email: 'test@example?.com',
    role: 'user',
  },
  expires: new Date(Date?.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Create providers wrapper
const Providers = ({ children, session = defaultSession }: ProvidersProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

// Custom render function
interface CustomRenderOptions {
  session?: Session | null;
  [key: string]: any;
}

const customRender = (ui: React?.ReactElement, options: CustomRenderOptions = {}) => {
  const { session, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }: { children: React?.ReactNode }) => (
      <Providers session={session}>{children}</Providers>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper function to create a mock session
export const createMockSession = (overrides?: Partial<Session>): Session => ({
  ...defaultSession,
  ...overrides,
});

// Helper function for async events
export const waitForLoadingToFinish = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
  try {
    await screen?.queryByRole('progressbar');
  } catch (error) {
    // If there is no loading indicator, that's okay
  }
};

// Helper for handling window?.matchMedia
export const createMatchMedia = (width: number) => {
  return (query: string): MediaQueryList => ({
    matches: width >= 768,
    media: query,
    onchange: null,
    addListener: vi?.fn(),
    removeListener: vi?.fn(),
    addEventListener: vi?.fn(),
    removeEventListener: vi?.fn(),
    dispatchEvent: vi?.fn(),
  });
};

// Helper for mocking ResizeObserver
export const mockResizeObserver = () => {
  class ResizeObserver {
    observe = vi?.fn();
    unobserve = vi?.fn();
    disconnect = vi?.fn();
  }

  window?.ResizeObserver = ResizeObserver;
};

// Helper for mocking Intersection Observer
export const mockIntersectionObserver = () => {
  class IntersectionObserver {
    observe = vi?.fn();
    unobserve = vi?.fn();
    disconnect = vi?.fn();
  }

  window?.IntersectionObserver = IntersectionObserver;
};

// Helper for form testing
export const fillForm = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');user: UserEvent, fields: Record<string, string>) => {
  for (const [label, value] of Object?.entries(fields)) {
    const input = screen?.getByLabelText(label) as HTMLElement;
    if (input) {
      await user?.type(input, value);
    }
  }
};

// Helper for testing drag and drop
export const simulateDragAndDrop = (dragElement: HTMLElement, dropElement: HTMLElement) => {
  const dataTransfer = new DataTransfer();

  fireEvent?.dragStart(dragElement, { dataTransfer });
  fireEvent?.dragEnter(dropElement, { dataTransfer });
  fireEvent?.dragOver(dropElement, { dataTransfer });
  fireEvent?.drop(dropElement, { dataTransfer });
  fireEvent?.dragEnd(dragElement, { dataTransfer });
};
