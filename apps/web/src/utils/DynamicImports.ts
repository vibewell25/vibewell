import dynamic from 'next/dynamic';
import { ComponentType, FC, lazy, Suspense, PropsWithChildren } from 'react';
import type { DynamicOptionsLoadingProps } from 'next/dynamic';
import { logger, PreloadConfig } from './shared';

// Default utility placeholders - will be replaced at runtime if available
let withPerformanceTracking = (component: any, _name?: string) => component;
let ComponentPreloader: { getInstance: () => { registerComponent: (name: string, config: any) => void } } = {
  getInstance: () => ({ registerComponent: () => {} })
};

// Dynamically import performance utilities without circular dependencies
if (typeof window !== 'undefined') {
  // Use dynamic import to avoid circular dependencies
  import('./performanceMonitor')
    .then(module => {
      if (module.withPerformanceTracking) {
        withPerformanceTracking = module.withPerformanceTracking;
      }
    })
    .catch(e => {
      logger.debug('Performance monitoring not available', e);
    });

  // Import component preloader without circular dependencies
  import('./ComponentPreloader')
    .then(module => {
      if (module.default) {
        ComponentPreloader = module.default;
      }
    })
    .catch(e => {
      logger.debug('Component preloader not available', e);
    });
}

/**
 * Unified Dynamic Import Utilities
 * 
 * This module provides a comprehensive approach to dynamic imports in Next.js
 */

// Common loading component
const DefaultLoadingComponent: FC = () => (
  <div className="flex h-full items-center justify-center">
    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

// Type definitions
export interface DynamicImportOptions {
  loading?: ComponentType<DynamicOptionsLoadingProps>;
  ssr?: boolean;
  suspense?: boolean;
  useSuspense?: boolean;
  preloadConfig?: {
    route?: string;
    userAction?: string;
    timeOnPage?: number;
    scrollDepth?: number;
  };
  trackPerformance?: boolean;
}

export type DynamicImportModule<T> = Promise<{
  default: ComponentType<T>;
  [key: string]: ComponentType<T> | any;
}>;

/**
 * Next.js dynamic import with expanded options
 */
export function dynamicImport<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: DynamicImportOptions = {},
) {
  const { 
    loading = DefaultLoadingComponent, 
    ssr = true,
    suspense = false, 
    trackPerformance = false,
    preloadConfig,
  } = options;
  
  // Add preload config if available
  if (preloadConfig) {
    const preloader = ComponentPreloader.getInstance();
    const componentName = importFn.toString();
    
    preloader.registerComponent(componentName, {
      component: importFn,
      conditions: preloadConfig,
    });
  }
  
  // Use Next.js dynamic import
  const DynamicComponent = dynamic(
    () => importFn().then((mod) => mod.default), 
    {
      loading,
      ssr,
      suspense,
    }
  );

  return trackPerformance 
    ? withPerformanceTracking(DynamicComponent, importFn.toString())
    : DynamicComponent;
}

/**
 * React.lazy implementation with Suspense fallback
 */
export function dynamicImportWithSuspense<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<DynamicImportOptions, 'suspense'> = {},
) {
  const LoadingComponent = options.loading || DefaultLoadingComponent;
  const LazyComponent = lazy(importFn);
  
  // Add preload config if available
  if (options.preloadConfig) {
    const preloader = ComponentPreloader.getInstance();
    const componentName = importFn.toString();
    
    preloader.registerComponent(componentName, {
      component: importFn,
      conditions: options.preloadConfig,
    });
  }
  
  const SuspenseWrapper: FC<PropsWithChildren<T>> = (props: any) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  return options.trackPerformance 
    ? withPerformanceTracking(SuspenseWrapper, importFn.toString())
    : SuspenseWrapper;
}

/**
 * Helper for dynamically importing any module
 */
export function importModule<T = any>(
  importFn: () => Promise<T>,
): Promise<T> {
  return importFn();
}

/**
 * Utility for client-side only components
 */
export function clientOnly<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<DynamicImportOptions, 'ssr'> = {},
) {
  return dynamicImport<T>(importFn, { ...options, ssr: false });
}

/**
 * Utility for SSR-enabled components
 */
export function ssrEnabled<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<DynamicImportOptions, 'ssr'> = {},
) {
  return dynamicImport<T>(importFn, { ...options, ssr: true });
}

/**
 * Utility for components with custom loading state
 */
export function withLoading<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  LoadingComponent: ComponentType,
  options: Omit<DynamicImportOptions, 'loading'> = {},
) {
  return dynamicImport<T>(importFn, { ...options, loading: LoadingComponent });
}

/**
 * Helper function to create dynamic imports with consistent configuration
 * and performance tracking
 */
export function createDynamicComponent<T>(
  importFn: () => Promise<{ default: ComponentType<T> }> | Promise<{ [key: string]: ComponentType<T> }>,
  options: DynamicImportOptions = {},
) {
  // Handle both default exports and named exports
  const normalizedImportFn = async () => {
    const mod = await importFn();
    return { default: 'default' in mod ? mod.default : Object.values(mod)[0] };
  };
  
  // Apply performance tracking by default
  return dynamicImport(normalizedImportFn, {
    ...options,
    trackPerformance: true,
  });
}

// For backwards compatibility
export { dynamicImport as lazyLoad };
export default dynamicImport; 