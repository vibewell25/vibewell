import 'jest-axe';

declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';

  interface AxeOptions {
    runOnly?: {
      type: 'tag' | 'rule';
      values: string[];
    };
    rules?: {
      [key: string]: {
        enabled: boolean;
      };
    };
    reporter?: 'v1' | 'v2' | 'no-passes';
    resultTypes?: ('passes' | 'violations' | 'incomplete' | 'inapplicable')[];
    selectors?: boolean;
    ancestry?: boolean;
    xpath?: boolean;
    absolutePaths?: boolean;
    iframes?: boolean;
    elementRef?: boolean;
    framewaitTime?: number;
    performanceTimer?: boolean;
  }

  function configureAxe(options: AxeOptions): void;
  function axe(html: Element | string, options?: AxeOptions): Promise<AxeResults>;
  function toHaveNoViolations(results: AxeResults): { pass: boolean; message: () => string };

  global {
    namespace jest {
      interface Matchers<R> {
        toHaveNoViolations(): R;
      }
    }
  }

  export { axe, configureAxe, toHaveNoViolations };
}
