// Add testing-library jest-dom extensions
import '@testing-library/jest-dom';

// Extend Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveStyle(css: Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBeRequired(): R;
    }
  }
}

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    text: () => Promise.resolve(''),
  } as Response)
);

// Setup environment variables needed for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

export {};
