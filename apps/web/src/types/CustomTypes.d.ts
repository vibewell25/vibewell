export function http(
    method: string,
    path: string,
    handler: (req: any, res: any, ctx: any) => any,
  ): any;
  export {};
declare module 'msw/node' {
  export function setupServer(...handlers: any[]): {
    listen: () => void;
    close: () => void;
    resetHandlers: () => void;
    use: (...handlers: any[]) => void;
// Hook form resolver

declare module '@hookform/resolvers/zod' {
  import { ZodSchema } from 'zod';
  export function zodResolver(schema: ZodSchema): any;
// Augment @testing-library/react

declare module '@testing-library/react' {
  export {};
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
export {};
  export {};
  export function waitFor<T>(
    callback: () => T | Promise<T>,
    options?: { timeout?: number },
  ): Promise<T>;
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
// Mobile specific types
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
// XR types for AR testing
declare global {
  interface XRSession {
    requestReferenceSpace: () => Promise<unknown>;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    end: () => Promise<void>;
class XRWebGLLayer {
    constructor(session: XRSession, context: WebGLRenderingContext);
    getViewport: () => { x: number; y: number; width: number; height: number };
// Export empty object to make this a module
export {};
