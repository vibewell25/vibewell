/**
 * Custom type declarations for third-party packages
 * 
 * This file includes type declarations for packages that don't have their own
 * TypeScript definitions or where the existing definitions need to be augmented.
 */

// MSW declarations
declare module 'msw' {
  export function http(method: string, path: string, handler: (req: any, res: any, ctx: any) => any): any;
  export const HttpResponse: {
    json: (body: any, init?: any) => any;
    text: (body: string, init?: any) => any;
    error: (status: number, body?: any) => any;
  };
}

declare module 'msw/node' {
  export function setupServer(...handlers: any[]): {
    listen: () => void;
    close: () => void;
    resetHandlers: () => void;
    use: (...handlers: any[]) => void;
  };
}

// Hook form resolver
declare module '@hookform/resolvers/zod' {
  import { ZodSchema } from 'zod';
  export function zodResolver(schema: ZodSchema): any;
}

// Augment @testing-library/react
declare module '@testing-library/react' {
  export const act: (callback: () => void | Promise<void>) => Promise<void>;
  export function render(component: React.ReactElement): {
    container: HTMLElement;
    getByText: (text: string) => HTMLElement;
    getByTestId: (testId: string) => HTMLElement;
    getByLabelText: (label: string) => HTMLElement;
    getByRole: (role: string) => HTMLElement;
    queryByText: (text: string) => HTMLElement | null;
    queryByTestId: (testId: string) => HTMLElement | null;
    findByText: (text: string) => Promise<HTMLElement>;
    findByTestId: (testId: string) => Promise<HTMLElement>;
    unmount: () => void;
  };
  export const screen: {
    getByText: (text: string) => HTMLElement;
    getByTestId: (testId: string) => HTMLElement;
    getByLabelText: (label: string) => HTMLElement;
    getByRole: (role: string) => HTMLElement;
    queryByText: (text: string) => HTMLElement | null;
    queryByTestId: (testId: string) => HTMLElement | null;
    findByText: (text: string) => Promise<HTMLElement>;
    findByTestId: (testId: string) => Promise<HTMLElement>;
  };
  export const fireEvent: {
    click: (element: HTMLElement) => void;
    change: (element: HTMLElement, options: { target: { value: any } }) => void;
    submit: (element: HTMLElement) => void;
    keyDown: (element: HTMLElement, options: { key: string }) => void;
    keyUp: (element: HTMLElement, options: { key: string }) => void;
  };
  export function waitFor<T>(callback: () => T | Promise<T>, options?: { timeout?: number }): Promise<T>;
}

// Extend Jest matchers with custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveFocus(): R;
    }
  }
}

// Mobile specific types
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

// XR types for AR testing
declare global {
  interface XRSession {
    requestReferenceSpace: () => Promise<unknown>;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    end: () => Promise<void>;
  }

  class XRWebGLLayer {
    constructor(session: XRSession, context: WebGLRenderingContext);
    getViewport: () => { x: number; y: number; width: number; height: number };
  }
}

// User event type for testing
declare const UserEvent: () => {
  type: (element: HTMLElement, text: string) => Promise<void>;
  click: (element: HTMLElement) => Promise<void>;
  tab: () => Promise<void>;
  hover: (element: HTMLElement) => Promise<void>;
  selectOptions: (element: HTMLElement, values: string[]) => Promise<void>;
  clear: (element: HTMLElement) => Promise<void>;
  upload: (element: HTMLElement, file: File) => Promise<void>;
};

// Export empty object to make this a module
export {}; 