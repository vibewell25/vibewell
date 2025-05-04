import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface UseErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
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
  options: UseErrorBoundaryOptions = {},
) {
  const { fallback, onError, onReset } = options;

  // Function to recursively wrap event handlers in children
  const wrapEventHandlers = (node: React.ReactNode): React.ReactNode => {
    return React.Children.map(node, (child) => {
      if (React.isValidElement<any>(child)) {
        const childProps = child.props as Record<string, any>;
        const newProps: Record<string, any> = {};
        Object.keys(childProps).forEach((key) => {
          const prop = childProps[key];
          if (key.startsWith('on') && typeof prop === 'function') {
            newProps[key] = (...args: any[]) => {
              try {
                prop(...args);
              } catch (error) {
                // Handle runtime error in event handler
                if (onError && error instanceof Error) {
                  onError(error, { componentStack: '' });
                }
              }
            };
          }
        });
        // Recursively wrap children
        const wrappedChildren = wrapEventHandlers(childProps.children);
        return React.cloneElement(child, newProps, wrappedChildren);
      }
      return child;
    });
  };

  const WrappedComponent = (props: P) => {
    const element = <Component {...props} />;
    const content = wrapEventHandlers(element);
    return (
      <ErrorBoundary fallback={fallback} onError={onError} onReset={onReset}>
        {content}
      </ErrorBoundary>
    );
  };

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}
