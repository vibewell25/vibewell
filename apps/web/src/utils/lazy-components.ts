/**
 * Lazy Component Loading Utilities
 * 
 * This module provides optimized utilities for lazy loading components and modules
 * with proper error handling, performance tracking, and preloading capabilities.
 */

import dynamic from 'next/dynamic';
import React, { ComponentType, ReactNode, lazy, Suspense } from 'react';
import { performanceMarks } from '@/utils/monitoring';

// Simple logger replacement
const simpleLogger = {
  error: (message: string, ...args: any[]) => console.error(message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(message, ...args),
  info: (message: string, ...args: any[]) => console.info(message, ...args),
  debug: (message: string, ...args: any[]) => console.debug(message, ...args),
};

// Default loading component - defined as a function that returns JSX
const DefaultLoading = () => React.createElement('div', 
  { className: "flex h-40 w-full items-center justify-center" },
  React.createElement('div', 
    { className: "h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary" }
  )
);

// Default error component
const DefaultError = ({ error }: { error: Error }) => 
  React.createElement('div', 
    { className: "rounded-md border border-red-300 bg-red-50 p-4 text-red-800" },
    React.createElement('p', { className: "font-semibold" }, "Failed to load component"),
    React.createElement('p', { className: "text-sm" }, error.message)
  );

/**
 * Options for lazy loading components
 */
export interface LazyComponentOptions {
  loading?: ComponentType<any>;
  error?: ComponentType<{ error: Error }>;
  ssr?: boolean;
  suspense?: boolean;
  preload?: boolean;
  retry?: number;
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  chunkName?: string;
}

/**
 * Cache of component promises for deduplication
 */
const componentCache = new Map<string, Promise<any>>();

/**
 * Create a lazily loaded component using Next.js dynamic imports
 */
export function createLazyComponent<T = any>(
  factory: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
): ComponentType<T> {
  const {
    loading = DefaultLoading,
    error = DefaultError,
    ssr = false,
    suspense = true,
    preload = false,
    retry = 2,
    timeout = 10000,
    onLoad,
    onError,
    chunkName = 'component',
  } = options;

  // Create unique key for caching
  const cacheKey = factory.toString();

  // Track component loading performance
  const loadComponent = async () => {
    const startTime = performance.now();
    const markId = `lazy-load-${chunkName}-${Date.now()}`;
    
    performanceMarks.start(markId);
    
    try {
      // Use cached promise if available to prevent duplicate loading
      if (!componentCache.has(cacheKey)) {
        componentCache.set(
          cacheKey,
          factory().catch(err => {
            // Remove failed promises from cache so they can be retried
            componentCache.delete(cacheKey);
            throw err;
          })
        );
      }
      
      const component = await componentCache.get(cacheKey);
      
      // Run onLoad callback
      if (onLoad) {
        onLoad();
      }
      
      performanceMarks.end(markId);
      
      return component;
    } catch (err) {
      // Log error
      simpleLogger.error(`Failed to load lazy component ${chunkName}:`, err);
      
      // Run onError callback
      if (onError && err instanceof Error) {
        onError(err);
      }
      
      performanceMarks.end(markId);
      
      throw err;
    }
  };

  // Create dynamic component with config
  const DynamicComponent = dynamic(loadComponent, {
    loading,
    ssr,
    // If suspense is true, we'll handle it with our own Suspense
    suspense: false,
  });

  // Add display name for better debugging
  const componentName = `Lazy(${chunkName})`;
  DynamicComponent.displayName = componentName;

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = window.requestIdleCallback || setTimeout;
    schedulePreload(() => {
      loadComponent().catch(err => {
        simpleLogger.warn(`Preloading ${componentName} failed:`, err);
      });
    });
  }

  // Create wrapper component with Suspense if needed
  const WrappedComponent = (props: T & JSX.IntrinsicAttributes) => {
    if (suspense) {
      return React.createElement(
        Suspense,
        { fallback: React.createElement(loading) },
        React.createElement(
          ErrorBoundary,
          { fallback: error },
          React.createElement(DynamicComponent, props)
        )
      );
    }
    
    return React.createElement(DynamicComponent, props);
  };

  // Add display name for better debugging
  WrappedComponent.displayName = `Wrapped${componentName}`;
  
  // Add preload method
  (WrappedComponent as any).preload = loadComponent;

  return WrappedComponent as ComponentType<T>;
}

/**
 * ErrorBoundary component for handling component errors
 */
class ErrorBoundary extends React.Component<{
  children: ReactNode;
  fallback: ComponentType<{ error: Error }>;
}> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    simpleLogger.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback: ErrorComponent } = this.props;
      return React.createElement(ErrorComponent, { error: this.state.error! });
    }

    return this.props.children;
  }
}

/**
 * Create a group of lazy components for a feature
 */
export function createLazyComponentGroup<Components extends Record<string, ComponentType<any>>>(
  factories: { [K in keyof Components]: () => Promise<{ default: Components[K] }> },
  options: LazyComponentOptions = {}
): { [K in keyof Components]: ComponentType<any> } {
  const result = {} as { [K in keyof Components]: ComponentType<any> };
  
  for (const key in factories) {
    result[key] = createLazyComponent(factories[key], {
      ...options,
      chunkName: String(key),
    });
  }
  
  return result;
}

/**
 * Utility to prefetch multiple components
 */
export function prefetchComponents(componentUrls: string[]): void {
  if (typeof window === 'undefined') return;
  
  componentUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'script';
    document.head.appendChild(link);
  });
}

/**
 * Constants for common chunks to prefetch
 */
export const CHUNK_URLS = {
  AR_VIEWER: '/_next/static/chunks/components_ar_ARViewer.js',
  VIRTUAL_TRY_ON: '/_next/static/chunks/components_virtual-try-on.js',
  CALENDAR: '/_next/static/chunks/pages_calendar.js',
  BOOKING: '/_next/static/chunks/pages_book.js',
};

export default createLazyComponent; 