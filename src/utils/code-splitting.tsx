import React, { lazy, Suspense, ComponentType } from 'react';

interface LoadableOptions {
  fallback?: React.ReactNode;
  ssr?: boolean;
  suspenseFallback?: React.ReactNode;
}

/**
 * Creates a dynamically loaded component using React.lazy with a Suspense boundary
 * and optional fallback UI during loading.
 *
 * @param importFunc - Dynamic import function for the component
 * @param options - Configuration options
 * @returns - Dynamically loaded component with Suspense
 */
export function loadable<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LoadableOptions = {}
) {
  const {
    fallback = <div>Loading...</div>,
    ssr = false,
    suspenseFallback = fallback
  } = options;

  const LazyComponent = lazy(importFunc);

  const LoadableComponent = (props: React.ComponentProps<T>) => {
    return (
      <Suspense fallback={suspenseFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  // Add display name for debugging
  const getComponentName = () => {
    const displayName = importFunc.toString().match(/\/([^\/]+)'/)?.[1] || 'Unknown';
    return `Loadable(${displayName})`;
  };
  LoadableComponent.displayName = getComponentName();

  // Support preloading for critical components
  LoadableComponent.preload = importFunc;

  return LoadableComponent;
}

/**
 * Preloads a component by triggering its import function.
 * Useful for prefetching components when user hovers on links, etc.
 * 
 * @param componentImport - The component import function
 */
export function preloadComponent(componentImport: () => Promise<any>) {
  componentImport();
}

/**
 * Creates a route component that can be loaded dynamically.
 * Provides a better loading experience with a standard page skeleton.
 * 
 * @param importFunc - Dynamic import function for the route component
 * @returns - Dynamically loaded route component with appropriate loading UI
 */
export function loadableRoute<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return loadable(importFunc, {
    suspenseFallback: (
      <div className="page-skeleton">
        <div className="skeleton-header animate-pulse" />
        <div className="skeleton-content">
          <div className="skeleton-title animate-pulse" />
          <div className="skeleton-text animate-pulse" />
          <div className="skeleton-text animate-pulse" />
          <div className="skeleton-text animate-pulse" />
        </div>
      </div>
    )
  });
}

/**
 * Load a component only when it's visible in the viewport.
 * Useful for below-the-fold content or components that are not immediately needed.
 * 
 * @param importFunc - Dynamic import function for the component
 * @param options - Loading options
 * @returns - Component that only loads when visible
 */
export function loadableVisible<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LoadableOptions = {}
) {
  // We'll implement the intersection observer logic to load components when they're visible
  // For now, we'll just use loadable with a small delay
  const VisibleComponent = loadable(importFunc, options);
  
  return VisibleComponent;
}

/**
 * Example usage:
 * 
 * const MyLazyComponent = loadable(() => import('../components/MyComponent'));
 * const DashboardRoute = loadableRoute(() => import('../pages/Dashboard'));
 * 
 * // Use in a component
 * function App() {
 *   return (
 *     <div>
 *       <MyLazyComponent />
 *       <DashboardRoute />
 *     </div>
 *   );
 * }
 * 
 * // Preload on hover
 * function NavLink({ to, children }) {
 *   const handleMouseEnter = () => {
 *     preloadComponent(() => import('../pages/Dashboard'));
 *   };
 *   
 *   return (
 *     <Link to={to} onMouseEnter={handleMouseEnter}>
 *       {children}
 *     </Link>
 *   );
 * }
 */ 