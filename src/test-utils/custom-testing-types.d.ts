// Type declarations for custom test utilities


declare module '@testing-library/react' {
  export interface RenderResult {
    renderTime?: number;
  }
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
    toHaveAttribute(attr: string, value?: string): R;
    toBeInTheDocument(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeEmpty(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeVisible(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveClass(...classNames: string[]): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: { [name: string]: any }): R;
    toHaveStyle(css: string | object): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
    toHaveValue(value?: string | string[] | number): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveDescription(text?: string | RegExp): R;
  }
}


declare module 'jest-axe' {
  export {};
  export const toHaveNoViolations: () => void;
}
