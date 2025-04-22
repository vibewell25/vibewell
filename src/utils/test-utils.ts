import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { performance } from 'perf_hooks';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  [key: string]: unknown;
}

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        <AuthProvider>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </AuthProvider>
      </ThemeProvider>
    ),
    ...options,
  });
}

// Helper to generate test cases for form validation
export function generateFormValidationTests(formComponent: ReactElement, testCases: Array<{
  field: string;
  value: string;
  expectedError?: string;
}>) {
  describe('form validation', () => {
    testCases.forEach(({ field, value, expectedError }) => {
      it(`validates ${field} with value "${value}"`, async () => {
        const { getByLabelText, findByText } = customRender(formComponent);
        const input = getByLabelText(field);
        await userEvent.type(input, value);
        await userEvent.tab();
        
        if (expectedError) {
          const error = await findByText(expectedError);
          expect(error).toBeInTheDocument();
        }
      });
    });
  });
}

// Helper to test API endpoints
export async function testApiEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  expectedStatus = 200,
) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  expect(response.status).toBe(expectedStatus);
  return response.json();
}

// Helper to test component accessibility
export async function testAccessibility(component: ReactElement) {
  const { container } = customRender(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

// Helper to test responsive behavior
export function testResponsiveBehavior(component: ReactElement, breakpoints: string[]) {
  describe('responsive behavior', () => {
    breakpoints.forEach(breakpoint => {
      it(`renders correctly at ${breakpoint}`, () => {
        window.resizeTo(parseInt(breakpoint), 800);
        const { container } = customRender(component);
        expect(container).toMatchSnapshot();
      });
    });
  });
}

export * from '@testing-library/react';
export { customRender as render };

interface TestClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export function createTestClient(config: TestClientConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: config.baseURL || 'http://localhost:3000',
    timeout: config.timeout || 5000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    },
    validateStatus: (status) => status < 500
  });
}

interface TestDataGenerators {
  user: () => any;
  post: () => any;
  comment: () => any;
}

const generators: TestDataGenerators = {
  user: () => ({
    id: Math.random().toString(36).substring(2, 9),
    name: `Test User ${Math.random().toString(36).substring(2, 5)}`,
    email: `test${Math.random().toString(36).substring(2, 5)}@example.com`
  }),
  post: () => ({
    id: Math.random().toString(36).substring(2, 9),
    title: `Test Post ${Math.random().toString(36).substring(2, 5)}`,
    content: `Test content ${Math.random().toString(36).substring(2, 20)}`
  }),
  comment: () => ({
    id: Math.random().toString(36).substring(2, 9),
    content: `Test comment ${Math.random().toString(36).substring(2, 20)}`,
    userId: Math.random().toString(36).substring(2, 9)
  })
};

export function generateTestData(type: keyof TestDataGenerators, count: number = 1): any[] {
  return Array(count).fill(null).map(() => generators[type]());
}

export async function measureRequestTime(fn: () => Promise<any>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
} 