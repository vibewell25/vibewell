import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations, Result } from 'jest-axe';
import { vi } from 'vitest';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { AuthProvider } from '../components/auth/AuthProvider';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

// Extend expect matchers
expect.extend(toHaveNoViolations);

// Enhanced accessibility options
export interface AccessibilityOptions extends RenderOptions {
  rules?: string[];
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
}

// Enhanced custom render function that includes providers and accessibility testing
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialTheme?: 'light' | 'dark';
    isAuthenticated?: boolean;
    accessibilityOptions?: AccessibilityOptions;
  }
) => {
  const {
    initialTheme = 'light',
    isAuthenticated = false,
    accessibilityOptions,
    ...renderOptions
  } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider initialTheme={initialTheme}>
        <AuthProvider initialAuthState={isAuthenticated}>{children}</AuthProvider>
      </ThemeProvider>
    );
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  // Add accessibility testing if options are provided
  if (accessibilityOptions) {
    return {
      ...result,
      async checkAccessibility() {
        const results = await axe(result.container, accessibilityOptions);
        expect(results).toHaveNoViolations();
        return results;
      },
    };
  }

  return result;
};

// Enhanced test runner with accessibility checks
const createTestRunner = ({
  setup = vi.fn(),
  teardown = vi.fn(),
  timeout = 5000,
  checkAccessibility = false,
  accessibilityOptions = {},
} = {}) => {
  return (
    name: string,
    testFn: () => Promise<void> | void,
    options: { only?: boolean; skip?: boolean } = {}
  ) => {
    const testMethod = options.only ? it.only : options.skip ? it.skip : it;

    testMethod(
      name,
      async () => {
        try {
          await setup();
          const result = await testFn();
          if (checkAccessibility) {
            await testAccessibility(result as ReactElement, accessibilityOptions);
          }
        } finally {
          await teardown();
        }
      },
      timeout
    );
  };
};

// Enhanced accessibility test helper with detailed reporting
const testAccessibility = async (
  ui: ReactElement,
  options?: AccessibilityOptions
): Promise<Result> => {
  const { container } = customRender(ui, { accessibilityOptions: options });
  const results = await axe(container, options);

  if (results.violations.length > 0) {
    console.error('\nAccessibility Violations:');
    results.violations.forEach(violation => {
      console.error(`\nRule: ${violation.id}`);
      console.error(`Impact: ${violation.impact}`);
      console.error(`Description: ${violation.description}`);
      console.error(`Help: ${violation.help}`);
      console.error('Elements:');
      violation.nodes.forEach(node => {
        console.error(`- ${node.html}`);
        console.error(`  ${node.failureSummary}`);
      });
    });
  }

  expect(results).toHaveNoViolations();
  return results;
};

// Integration test helper
export const createIntegrationTest = (
  description: string,
  steps: Array<{
    name: string;
    action: () => Promise<void>;
    assertion: () => Promise<void>;
  }>,
  options?: {
    timeout?: number;
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
  }
) => {
  const { timeout = 10000, setup, teardown } = options || {};

  it(
    description,
    async () => {
      if (setup) await setup();

      try {
        for (const step of steps) {
          console.log(`\nExecuting step: ${step.name}`);
          await step.action();
          await step.assertion();
        }
      } finally {
        if (teardown) await teardown();
      }
    },
    timeout
  );
};

// User interaction helper
export const userInteractions = {
  async clickButton(name: string | RegExp) {
    const button = screen.getByRole('button', { name });
    await userEvent.click(button);
  },

  async fillForm(formTestId: string, fields: Record<string, string>) {
    const form = screen.getByTestId(formTestId);
    for (const [label, value] of Object.entries(fields)) {
      const input = within(form).getByLabelText(label);
      await userEvent.type(input, value);
    }
  },

  async selectOption(label: string, option: string) {
    const select = screen.getByLabelText(label);
    await userEvent.selectOptions(select, option);
  },

  async dragAndDrop(sourceTestId: string, targetTestId: string) {
    const source = screen.getByTestId(sourceTestId);
    const target = screen.getByTestId(targetTestId);

    // Simulate drag and drop events
    fireEvent.dragStart(source);
    fireEvent.dragEnter(target);
    fireEvent.dragOver(target);
    fireEvent.drop(target);
    fireEvent.dragEnd(source);
  },
};

// Re-export existing performance measurement utilities
export {
  measurePerformance,
  measureMemoryUsage,
  measureFrameRate,
  measureNetworkRequest,
  createPerformanceObserver,
  measurePaintTiming,
  measureLongTasks,
  setupIntersectionObserverMock,
  setupResizeObserverMock,
};

// Export enhanced utilities
export { customRender as render, createTestRunner, testAccessibility };
