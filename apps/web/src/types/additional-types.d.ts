
// Additional type definitions for third-party libraries

// React Testing Library extensions

declare module '@testing-library/react' {
  export interface RenderResult {
    renderTime?: number;
    axeResults?: any;
  }
}

// Performance API extensions for newer web performance APIs
interface PerformanceNavigationTiming extends PerformanceResourceTiming {
  domComplete: number;
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  domInteractive: number;
  loadEventEnd: number;
  loadEventStart: number;
  redirectCount: number;
  type: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

interface LargestContentfulPaint extends PerformanceEntry {
  element: Element | null;
  id: string;
  loadTime: number;
  renderTime: number;
  size: number;
  url: string;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
}

interface FirstInputDelay extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  target: Node;
}

// Extend the window interface to include newer Performance APIs
interface Window {
  PerformanceObserver: typeof PerformanceObserver;
  performance: Performance & {
    getEntriesByType(type: 'navigation'): PerformanceNavigationTiming[];
    getEntriesByType(type: 'resource'): PerformanceResourceTiming[];
    getEntriesByType(type: 'paint'): PerformanceEntry[];
    getEntriesByType(type: string): PerformanceEntry[];
    getEntriesByName(name: string, type?: string): PerformanceEntry[];
    mark(markName: string): void;
    measure(measureName: string, startMark?: string, endMark?: string): void;
    clearMarks(markName?: string): void;
    clearMeasures(measureName?: string): void;
    now(): number;
    timeOrigin: number;
  };
}


// Jest-axe extensions
declare namespace jest {
  interface Matchers<R, T> {
    toHaveNoViolations(): R;
  }
}


declare module 'jest-axe' {
  export interface AxeResults {
    violations: any[];
    passes: any[];
    incomplete: any[];
    inapplicable: any[];
  }

  export {};

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): {
      pass: boolean;
      message(): string;
    };
  };

  export function configureAxe(
    options: any,
  ): (html: Element | string, options?: any) => Promise<AxeResults>;

  export function axeTest(html: Element | string, options?: any): Promise<AxeResults>;
}
