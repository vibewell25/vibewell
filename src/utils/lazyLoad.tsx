import React, { Suspense, ComponentType, PropsWithChildren } from 'react';

// Loading component that will be shown while the actual component is loading
export const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-24">
    <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
  </div>
);

// Type for lazy loaded component props
type LazyComponentProps<P = {}> = {
  Component: React.LazyExoticComponent<ComponentType<P>>;
  props?: P;
  fallback?: React.ReactNode;
};

// Lazy component wrapper
export const LazyComponent = <P extends object>({
  Component,
  props,
  fallback = <LoadingFallback />,
}: LazyComponentProps<P>) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...(props as P)} />
    </Suspense>
  );
};

// HOC to lazy load any component
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = <LoadingFallback />
) {
  const LazyLoadedComponent = React.lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={fallback}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
}
