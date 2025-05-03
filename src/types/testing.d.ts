declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeInvalid(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: { [key: string]: any }): R;
      toHaveStyle(style: string | Record<string, any>): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      toHaveValue(value: any): R;
      toBeChecked(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBePartiallyChecked(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toContainElement(element: Element | null): R;
      toContainHTML(htmlText: string): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveNoViolations(): R;
      toHaveDisplayValue(value: string | string[] | RegExp): R;
      toHaveProperty(property: string, value?: any): R;
      // Additional matchers used in tests
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(times: number): R;
      // Basic Jest matchers missing in security tests
      toBe(expected: any): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeDefined(): R;
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toContain(expected: any): R;
      toMatch(expected: string | RegExp): R;
      toThrow(expected?: string | Error | RegExp): R;
      toMatchObject(expected: object): R;
      toBeGreaterThanOrEqual(expected: number): R;
      not: Matchers<R>;
    }
  }

  // Add missing expect static properties
  namespace jest {
    interface ExpectStatic {
      anything(): any;
      any(constructor: Function): any;
      objectContaining(obj: object): any;
      stringContaining(str: string): any;
      arrayContaining(arr: any[]): any;
      extend(matchers: Record<string, any>): void;
    }
  }
}

// For using MSW in tests
declare namespace NodeJS {
  interface Global {
    fetch: any;
  }
}

// This export is necessary to make TypeScript treat this as a module
export {};

// Extended DOM type with data-* attributes
interface HTMLElement {
  dataset: {
    [key: string]: string;
  };
}


// Extend Element interface to include data-testid
declare namespace React {
  interface HTMLAttributes<T> {

    'data-testid'?: string;

    'data-user'?: string;

    'data-test'?: string;
  }
}

// Type declaration for CSS modules
declare module '*.module?.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module?.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}


// Types for jest-axe are already imported at the top, don't redeclare here
// (Removed duplicate declarations for axe and toHaveNoViolations)

// Performance API extensions
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface PerformanceNavigationTiming extends PerformanceEntry {
  // Navigation timing specific properties
  domComplete: number;
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  domInteractive: number;
  fetchStart: number;
  loadEventEnd: number;
  loadEventStart: number;
  navigationStart: number;
  redirectCount: number;
  redirectEnd: number;
  redirectStart: number;
  requestStart: number;
  responseEnd: number;
  responseStart: number;
  unloadEventEnd: number;
  unloadEventStart: number;
}

interface PerformanceObserverEntryList {
  getEntries(): PerformanceEntry[];
  getEntriesByName(name: string, type?: string): PerformanceEntry[];
  getEntriesByType(type: string): PerformanceEntry[];
}

interface LayoutShiftAttribution {
  node?: Node;
  previousRect: DOMRectReadOnly;
  currentRect: DOMRectReadOnly;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
  sources: LayoutShiftAttribution[];
}

interface FirstInputDelayEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  target: Node;
}
