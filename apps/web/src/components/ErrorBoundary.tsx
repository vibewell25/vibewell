'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/BaseButton';

/**
 * Error type with optional context information
 */
interface ErrorWithContext extends Error {
  context?: Record<string, any>;
  componentStack?: string;
}

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Content to render */
  children: ReactNode;
  /** Fallback component to render when an error occurs */
  fallback?: ReactNode | ((error: ErrorWithContext, reset: () => void) => ReactNode);
  /** Function to call when an error occurs */
  onError?: (error: ErrorWithContext, errorInfo: ErrorInfo) => void;
  /** Component to use as a fallback for specific error types */
  errorComponent?: React.ComponentType<{ error: ErrorWithContext; reset: () => void }>;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Message to show when an error occurs */
  errorMessage?: string;
  /** Custom retry message */
  retryMessage?: string;
  /** Components to show for specific error types */
  errorComponentMap?: Map<string, React.ComponentType<{ error: ErrorWithContext; reset: () => void }>>;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorWithContext | null;
}

/**
 * Default fallback component shown when an error occurs
 */
const DefaultFallback: React.FC<{ 
  error: ErrorWithContext; 
  reset: () => void;
  showRetry?: boolean;
  errorMessage?: string;
  retryMessage?: string;
}> = ({ 
  error, 
  reset, 
  showRetry = true,
  errorMessage = 'Something went wrong',
  retryMessage = 'Try again'
}) => {
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{errorMessage}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {error.message || 'An unexpected error occurred. Please try again later.'}
          </p>
        </div>
      </div>

      {error.context && (
        <div className="mt-4 rounded bg-gray-50 p-3">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700">Technical details</summary>
            <pre className="mt-2 max-h-96 overflow-auto text-xs text-gray-600">
              {JSON.stringify(error.context, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {showRetry && (
          <Button onClick={reset} variant="default">
            {retryMessage}
          </Button>
        )}
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Refresh page
        </Button>
      </div>
    </div>
  );
};

/**
 * Component to enhance API error display
 */
export const ApiErrorFallback: React.FC<{ 
  error: ErrorWithContext; 
  reset: () => void 
}> = ({ error, reset }) => {
  let title = 'API Request Failed';
  let description = 'We couldn\'t complete your request. Please try again.';
  let actionText = 'Try Again';
  let status: number | undefined;
  
  // Handle specific API error status codes
  if (error.context?.status) {
    status = error.context.status;
    
    if (status === 401 || status === 403) {
      title = 'Not Authorized';
      description = 'You don\'t have permission to access this resource. Please log in or contact support.';
      actionText = 'Back to Home';
    } else if (status === 404) {
      title = 'Resource Not Found';
      description = 'The requested resource couldn\'t be found. It may have been moved or deleted.';
      actionText = 'Back to Home';
    } else if (status === 429) {
      title = 'Too Many Requests';
      description = 'You\'ve made too many requests. Please wait a moment and try again.';
      actionText = 'Try Again Later';
    } else if (status >= 500) {
      title = 'Server Error';
      description = 'Our server encountered an error. Our team has been notified, please try again later.';
      actionText = 'Try Again Later';
    }
  }
  
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 rounded-full bg-amber-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          {error.message && (
            <p className="mt-1 text-xs text-gray-500">Error: {error.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={status && status >= 500 ? () => window.location.reload() : reset}
          variant="default"
        >
          {actionText}
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

/**
 * Component to handle network connectivity issues
 */
export const NetworkErrorFallback: React.FC<{ 
  error: ErrorWithContext; 
  reset: () => void 
}> = ({ error, reset }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  // Listen for online/offline status changes
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 rounded-full bg-blue-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {isOnline ? 'Connection Error' : 'You\'re Offline'}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {isOnline 
              ? 'We couldn\'t connect to our servers. Please check your internet connection and try again.'
              : 'Your device is currently offline. Please check your internet connection.'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="ml-2 text-sm font-medium">
          {isOnline ? 'Internet connection available' : 'No internet connection'}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={reset}
          variant="default"
          disabled={!isOnline}
        >
          {isOnline ? 'Try Again' : 'Retry When Online'}
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};

/**
 * Component to handle permission errors
 */
export const PermissionErrorFallback: React.FC<{ 
  error: ErrorWithContext; 
  reset: () => void 
}> = ({ error }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 rounded-full bg-purple-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Permission Required</h3>
          <p className="mt-1 text-sm text-gray-600">
            You don't have permission to access this feature or resource.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => window.location.href = '/login'}
          variant="default"
        >
          Log In
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

/**
 * ErrorBoundary component for handling errors gracefully
 * 
 * This component catches errors in child components and displays a user-friendly
 * error message instead of crashing the app.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Something went wrong: {error.message}</p>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: ErrorWithContext): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: ErrorWithContext, errorInfo: ErrorInfo): void {
    // Add componentStack to the error object for better debugging
    error.componentStack = errorInfo.componentStack;
    
    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error to the console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  /**
   * Reset the error state to try rendering the children again
   */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  /**
   * Determine the appropriate error component based on the error
   */
  getErrorComponent(error: ErrorWithContext): React.ComponentType<{ error: ErrorWithContext; reset: () => void }> {
    const { errorComponentMap, errorComponent } = this.props;
    
    // Check if we have a specific component for this error type in the map
    if (errorComponentMap) {
      // Check for HTTP status codes in the error context
      if (error.context?.status) {
        const status = error.context.status;
        
        if (status === 401 || status === 403) {
          return errorComponentMap.get('permission') || PermissionErrorFallback;
        }
        
        if (status >= 400 && status < 600) {
          return errorComponentMap.get('api') || ApiErrorFallback;
        }
      }
      
      // Check for network errors
      if (error.message && (
        error.message.includes('network') ||
        error.message.includes('offline') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')
      )) {
        return errorComponentMap.get('network') || NetworkErrorFallback;
      }
      
      // Check for permission errors
      if (error.message && (
        error.message.includes('permission') ||
        error.message.includes('unauthorized') ||
        error.message.includes('forbidden') ||
        error.message.includes('not allowed')
      )) {
        return errorComponentMap.get('permission') || PermissionErrorFallback;
      }
    }
    
    // Fall back to the provided error component or the default
    return errorComponent || DefaultFallback;
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry, errorMessage, retryMessage } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }
      
      // Otherwise, use the appropriate error component
      const ErrorComponent = this.getErrorComponent(error);
      
      if (ErrorComponent === DefaultFallback) {
        return (
          <DefaultFallback 
            error={error} 
            reset={this.handleReset} 
            showRetry={showRetry}
            errorMessage={errorMessage}
            retryMessage={retryMessage}
          />
        );
      }
      
      return <ErrorComponent error={error} reset={this.handleReset} />;
    }

    return children;
  }
}

/**
 * A specialized error boundary for handling API errors
 */
export const ApiErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      errorComponent={ApiErrorFallback}
      {...props}
    />
  );
};

/**
 * A specialized error boundary for handling network errors
 */
export const NetworkErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      errorComponent={NetworkErrorFallback}
      {...props}
    />
  );
};

/**
 * A specialized error boundary for handling permission errors
 */
export const PermissionErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      errorComponent={PermissionErrorFallback}
      {...props}
    />
  );
};

// Default error component map for common error types
const defaultErrorComponentMap = new Map<string, React.ComponentType<{ error: ErrorWithContext; reset: () => void }>>([
  ['api', ApiErrorFallback],
  ['network', NetworkErrorFallback],
  ['permission', PermissionErrorFallback],
]);

/**
 * A comprehensive error boundary that handles different types of errors
 */
export const SmartErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      errorComponentMap={defaultErrorComponentMap}
      {...props}
    />
  );
};

export default ErrorBoundary; 