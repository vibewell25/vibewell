// This file provides TypeScript type definitions for testing libraries

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

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
      toHaveStyle(style: string): R;
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