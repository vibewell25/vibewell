import React from 'react';
import { render, RenderOptions, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { TEST_CONFIG } from '../config/test-config';

// Mock components for provider wrappers
const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="theme-provider">{children}</div>;
};

const MockQueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="query-client-provider">{children}</div>;
};

// Create a custom render function that includes providers
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MockQueryClientProvider>
        <MockThemeProvider>
          {children}
        </MockThemeProvider>
      </MockQueryClientProvider>
    ),
    ...options,
  });
}

// Alias for renderWithProviders that matches the test component usage
const renderWithProviders = customRender;

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
const simulateUserAction = async ({ 
  action, 
  delay = 100 // default animation timeout
}: { 
  action: () => void, 
  delay?: number 
}) => {
  const start = Date.now();
  action();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  await wait(delay);
};

// Helper to clear all mocks and localStorage
const cleanupTest = () => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
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
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    (window as any).IntersectionObserver = vi.fn(() => ({
      observe,
      unobserve,
      disconnect,
    }));
  });
  
  return { observe, unobserve, disconnect };
};

// Helper to mock resize observer
const mockResizeObserver = () => {
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    (window as any).ResizeObserver = vi.fn(() => ({
      observe,
      unobserve,
      disconnect,
    }));
  });
  
  return { observe, unobserve, disconnect };
};

// Helper to create test IDs
const createTestId = (component: string, element: string) => `${component}-${element}`;

// Helper for testing accessibility
const testAccessibility = async (ui: React.ReactElement) => {
  const { container } = renderWithProviders(ui);
  // Typically you'd use axe-core or similar here
  // For now we'll just return a placeholder
  return { violations: [] };
};

// Helper for measuring performance
const measurePerformance = async (ui: React.ReactElement) => {
  const start = performance.now();
  renderWithProviders(ui);
  const end = performance.now();
  return { 
    duration: end - start,
    average: end - start 
  };
};

export {
  customRender as render,
  renderWithProviders,
  screen,
  fireEvent,
  vi,
  wait,
  generateTestId,
  mockApiResponse,
  simulateUserAction,
  cleanupTest,
  mockWindowLocation,
  mockIntersectionObserver,
  mockResizeObserver,
  createTestId,
  testAccessibility,
  measurePerformance,
};
