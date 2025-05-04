import { render, RenderOptions } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { performance } from 'perf_hooks';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

expect.extend(toHaveNoViolations);

interface TestRunnerOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  mockApi?: boolean;
  mockTheme?: boolean;
  mockQuery?: boolean;
  performanceThreshold?: number;
}

interface PerformanceResult {
  renderTime: number;
  hydrationTime: number;
  totalTime: number;
  memoryUsage: number;
  passes: boolean;
}

export class TestRunner {
  private queryClient: QueryClient;
  private options: TestRunnerOptions;

  constructor(options: TestRunnerOptions = {}) {
    this.options = {
      performanceThreshold: 100, // 100ms default threshold
      mockApi: true,
      mockTheme: true,
      mockQuery: true,
      ...options,
    };

    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
  }

  private createWrapper() {
    return ({ children }: { children: React.ReactNode }) => {
      let wrapped = children;

      if (this.options.mockQuery) {
        wrapped = (
          <QueryClientProvider client={this.queryClient}>
            {wrapped}
          </QueryClientProvider>
        );
      }

      if (this.options.mockTheme) {
        wrapped = (
          <ThemeProvider defaultTheme="light" storageKey="vibe-theme">
            {wrapped}
          </ThemeProvider>
        );
      }

      return wrapped;
    };
  }

  render(ui: React.ReactElement) {
    const wrapper = this.createWrapper();
    return {
      ...render(ui, { wrapper }),
      runner: this,
    };
  }

  async testAccessibility(ui: React.ReactElement) {
    const { container } = this.render(ui);
    const results = await axe(container);
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
    };
  }

  async measurePerformance(ui: React.ReactElement, iterations = 5): Promise<PerformanceResult> {
    const times: number[] = [];
    const memoryUsage: number[] = [];

    for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      const startMemory = process.memoryUsage().heapUsed;
      const startTime = performance.now();
      
      const { unmount } = this.render(ui);
      const renderTime = performance.now() - startTime;
      
      // Simulate hydration
      const hydrationStart = performance.now();
      unmount();
      this.render(ui);
      const hydrationTime = performance.now() - hydrationStart;

      const endMemory = process.memoryUsage().heapUsed;
      
      times.push(renderTime + hydrationTime);
      memoryUsage.push(endMemory - startMemory);
    }

    const totalTime = times.reduce((a, b) => a + b, 0) / iterations;
    const avgMemoryUsage = memoryUsage.reduce((a, b) => a + b, 0) / iterations;

    return {
      renderTime: times.reduce((a, b) => a + b, 0) / iterations,
      hydrationTime: times.reduce((a, b) => a + b, 0) / iterations,
      totalTime,
      memoryUsage: avgMemoryUsage,
      passes: totalTime < this.options.performanceThreshold,
    };
  }

  async testInteractivity(ui: React.ReactElement) {
    const { container } = this.render(ui);
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    
    const results = await Promise.all(
      Array.from(interactiveElements).map(async (element) => {
        const isReachable = await this.isElementReachable(element as HTMLElement);
        const hasAccessibleName = await this.hasAccessibleName(element as HTMLElement);
        
        return {
          element,
          isReachable,
          hasAccessibleName,
          passes: isReachable && hasAccessibleName,
        };
      })
    );

    return {
      totalElements: interactiveElements.length,
      results,
      passes: results.every(r => r.passes),
    };
  }

  private async isElementReachable(element: HTMLElement): Promise<boolean> {
    const style = window.getComputedStyle(element);
    return !(
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      element.hasAttribute('aria-hidden')
    );
  }

  private async hasAccessibleName(element: HTMLElement): Promise<boolean> {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent.trim()
    );
  }
}

export const createTestRunner = (options?: TestRunnerOptions) => new TestRunner(options); 