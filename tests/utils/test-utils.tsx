import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect } from '@jest/globals';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialState?: Record<string, unknown>;
}

export const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vibe-theme">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const wrapper = createWrapper();
  return {
    ...render(ui, { wrapper, ...options }),
    user: userEvent.setup(),
  };
};

// Accessibility testing helper
export const testAccessibility = async (ui: React.ReactElement) => {
  const { container } = renderWithProviders(ui);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Performance testing helper
export const measurePerformance = async (
  component: React.ReactElement,
  iterations = 100
) => {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderWithProviders(component);
    const end = performance.now();
    times.push(end - start);
  }

  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
  };
};

// Mock data generator helper
export const createMockData = <T extends Record<string, unknown>>(
  template: T,
  overrides?: Partial<T>
): T => {
  return {
    ...template,
    ...overrides,
  };
};

// Event simulation helpers
export const simulateNetworkCondition = (condition: 'slow' | 'offline' | 'fast') => {
  if (condition === 'offline') {
    // @ts-ignore - mock service worker property
    window.navigator.onLine = false;
    window.dispatchEvent(new Event('offline'));
  } else {
    // @ts-ignore - mock service worker property
    window.navigator.onLine = true;
    window.dispatchEvent(new Event('online'));
  }
};

// Form testing helpers
export const fillForm = async (user: ReturnType<typeof userEvent.setup>, formData: Record<string, string>) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) {
      await user.type(input as HTMLElement, value);
    }
  }
};

export * from '@testing-library/react';
export { userEvent }; 