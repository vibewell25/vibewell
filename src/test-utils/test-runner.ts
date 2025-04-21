/**
 * Re-export test runner functionality
 * This file provides backward compatibility with existing imports
 */

import { render, RenderOptions } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export interface TestRunnerOptions extends RenderOptions {
  name: string;
  performanceThreshold?: number;
}

export const createTestRunner = (name: string) => {
  const runComponentTest = async (
    element: React.ReactElement,
    options?: Omit<TestRunnerOptions, 'name'>
  ) => {
    const startTime = performance.now();
    const { container } = render(element, options);
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Run accessibility tests
    const results = await axe(container);

    return {
      renderTime,
      accessibilityResults: results,
      container,
    };
  };

  return {
    name,
    runComponentTest,
  };
};

export * from './custom-test-runner';
