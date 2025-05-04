import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TEST_CONFIG } from '../config/test-config';

// Create a custom render function that includes providers
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    ),
    ...options,
  });
}

// Helper to wait for a specific timeout
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate random test data
const generateTestId = () => Math.random().toString(36).substring(7);

// Helper to mock API responses
const mockApiResponse = (status: number, data: any) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Helper to simulate user events with delay
const simulateUserAction = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');action: () => void, delay = TEST_CONFIG.ANIMATION_TIMEOUT) => {
  action();
  await wait(delay);
};

// Helper to clear all mocks and localStorage
const cleanupTest = () => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
};

// Helper to mock window location
const mockWindowLocation = (url: string) => {
  const originalLocation = window.location;
  delete (window as any).location;
  window.location = new URL(url) as any;
  return () => {
    window.location = originalLocation;
  };
};

// Helper to mock intersection observer
const mockIntersectionObserver = () => {
  const observe = jest.fn();
  const unobserve = jest.fn();
  const disconnect = jest.fn();

  beforeEach(() => {
    (window as any).IntersectionObserver = jest.fn(() => ({
      observe,
      unobserve,
      disconnect,
    }));
  });

  return { observe, unobserve, disconnect };
};

// Helper to mock resize observer
const mockResizeObserver = () => {
  const observe = jest.fn();
  const unobserve = jest.fn();
  const disconnect = jest.fn();

  beforeEach(() => {
    (window as any).ResizeObserver = jest.fn(() => ({
      observe,
      unobserve,
      disconnect,
    }));
  });

  return { observe, unobserve, disconnect };
};

// Helper to create test IDs
const createTestId = (component: string, element: string) => `${component}-${element}`;

export {
  customRender as render,
  wait,
  generateTestId,
  mockApiResponse,
  simulateUserAction,
  cleanupTest,
  mockWindowLocation,
  mockIntersectionObserver,
  mockResizeObserver,
  createTestId,
}; 