import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface DynamicImportOptions {
  ssr?: boolean;
  loading?: ComponentType;
  suspense?: boolean;
}

/**
 * Utility function for dynamically importing components with consistent options
 * @param importFn - Import function that returns a promise of a component
 * @param options - Dynamic import options
 * @returns Dynamically imported component
 */
export function dynamicImport<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: DynamicImportOptions = {}
) {
  const {
    ssr = true,
    loading: LoadingComponent,
    suspense = false,
  } = options;

  return dynamic(importFn, {
    ssr,
    loading: LoadingComponent,
    suspense,
  });
}

/**
 * Utility function for dynamically importing heavy components with default settings
 * @param importFn - Import function that returns a promise of a component
 * @returns Dynamically imported component with loading state
 */
export function lazyLoad<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
) {
  return dynamicImport<T>(importFn, {
    ssr: false,
    suspense: true,
  });
}

/**
 * Utility function for dynamically importing components that should be rendered on client-side only
 * @param importFn - Import function that returns a promise of a component
 * @returns Dynamically imported component for client-side only
 */
export function clientOnly<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
) {
  return dynamicImport<T>(importFn, {
    ssr: false,
  });
}

/**
 * Utility function for dynamically importing components with SSR enabled
 * @param importFn - Import function that returns a promise of a component
 * @returns Dynamically imported component with SSR enabled
 */
export function ssrEnabled<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
) {
  return dynamicImport<T>(importFn, {
    ssr: true,
  });
}

/**
 * Utility function for dynamically importing components with custom loading state
 * @param importFn - Import function that returns a promise of a component
 * @param LoadingComponent - Component to show while loading
 * @returns Dynamically imported component with custom loading state
 */
export function withLoading<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  LoadingComponent: ComponentType,
) {
  return dynamicImport<T>(importFn, {
    loading: LoadingComponent,
  });
} 