import React, { Suspense, ComponentType } from 'react';

// Loading component that will be shown while the actual component is loading
export const LoadingFallback = () => (
  <div className="flex h-24 w-full items-center justify-center">
    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2 border-t-2"></div>
  </div>
// Type for lazy loaded component props
type LazyComponentProps<P = {}> = {
  Component: React.LazyExoticComponent<ComponentType<P>>;
  props?: P;
  fallback?: React.ReactNode;
// Lazy component wrapper
export {};

// HOC to lazy load any component
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = <LoadingFallback />,
) {
  const LazyLoadedComponent = React.lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={fallback}>
      <LazyLoadedComponent {...props} />
    </Suspense>
