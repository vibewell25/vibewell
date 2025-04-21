import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface UseErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * A hook that provides a wrapper component with error boundary protection.
 *
 * @param options - Configuration options for the error boundary
 * @returns A wrapper component that can be used to wrap any component with error boundary protection
 *
 * @example
 * const ErrorBoundaryWrapper = useErrorBoundary();
 *
 * return (
 *   <ErrorBoundaryWrapper>
 *     <ComponentThatMightThrow />
 *   </ErrorBoundaryWrapper>
 * );
 */
export function useErrorBoundary(options: UseErrorBoundaryOptions = {}) {
  const { fallback, onError } = options;

  const ErrorBoundaryWrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );

  return ErrorBoundaryWrapper;
}

/**
 * A higher-order component that wraps a component with an error boundary.
 *
 * @param Component - The component to wrap
 * @param options - Configuration options for the error boundary
 * @returns A wrapped component with error boundary protection
 *
 * @example
 * const SafeComponent = withErrorBoundary(RiskyComponent);
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: UseErrorBoundaryOptions = {}
) {
  const { fallback, onError } = options;

  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}
