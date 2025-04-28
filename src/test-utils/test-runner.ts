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

export {};

export * from './custom-test-runner';
