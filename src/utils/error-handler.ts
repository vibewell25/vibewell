import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { isError, exists, isString } from './type-guards';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error source types
export enum ErrorSource {
  CLIENT = 'client',
  SERVER = 'server',
  NETWORK = 'network',
  THIRD_PARTY = 'third-party',
  API = 'api' // Added for ProductDataFetcher
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  API = 'api',
  RENDERING = 'rendering',
  RESOURCE = 'resource',
  RESOURCE_NOT_FOUND = 'resource-not-found', // Added for ProductDataFetcher
  STATE = 'state',
  USER_INPUT = 'user-input',
  WEBXR = 'webxr',
  UNKNOWN = 'unknown',
  SERVER = 'server', // Added for ProductDataFetcher
  TIMEOUT = 'timeout' // Added for ProductDataFetcher
}

// Interface for error metadata
export interface ErrorMetadata {
  [key: string]: any;
}

// Interface for a standardized error
export interface AppError {
  message: string;
  originalError?: Error;
  severity: ErrorSeverity;
  source: ErrorSource;
  category: ErrorCategory;
  code?: string;
  timestamp: Date;
  metadata?: ErrorMetadata;
  retryFunction?: () => void;
  retry?: () => void; // Added for ProductDataFetcher
}

// Context interface
export interface ErrorHandlerContextValue {
  captureError: (error: Error | string, options?: Partial<AppError>) => AppError;
  logError: (error: AppError) => void;
  showErrorToUser: (error: AppError) => void;
  dismissError: () => void;
  wrapPromise: <T>(promise: Promise<T>, options?: Partial<AppError>) => Promise<T>;
  createError: (message: string, options?: Partial<AppError>) => AppError;
  currentError: AppError | null;
  hasError: boolean;
  clearErrors: () => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: Partial<AppError>
  ) => (...args: T) => Promise<R>;
}

// Create context
const ErrorHandlerContext = createContext<ErrorHandlerContextValue | undefined>(undefined);

// Provider props
interface ErrorHandlerProviderProps {
  children: ReactNode;
  onError?: (error: AppError) => void;
  logToServer?: (error: AppError) => Promise<void>;
}

// Create standard error object
const createStandardError = (
  message: string,
  options?: Partial<AppError>
): AppError => {
  return {
    message,
    severity: options?.severity || ErrorSeverity.ERROR,
    source: options?.source || ErrorSource.CLIENT,
    category: options?.category || ErrorCategory.UNKNOWN,
    timestamp: new Date(),
    code: options?.code,
    originalError: options?.originalError,
    metadata: options?.metadata || {},
    retryFunction: options?.retryFunction,
    retry: options?.retry
  };
};

// Provider Component
export const ErrorHandlerProvider: React.FC<ErrorHandlerProviderProps> = ({
  children,
  onError,
  logToServer
}) => {
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // Log error
  const logError = useCallback((error: AppError) => {
    console.error(
      `[${error.severity}][${error.source}][${error.category}]: ${error.message}`,
      { error }
    );
    
    if (logToServer) {
      logToServer(error).catch(console.error);
    }
  }, [logToServer]);

  // Show error
  const showErrorToUser = useCallback((error: AppError) => {
    setCurrentError(error);
    if (exists(onError)) {
      onError(error);
    }
  }, [onError]);

  // Dismiss error
  const dismissError = useCallback(() => {
    setCurrentError(null);
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setCurrentError(null);
  }, []);

  // Capture error
  const captureError = useCallback((
    errorOrMessage: Error | string,
    options?: Partial<AppError>
  ): AppError => {
    let message: string;
    let originalError: Error | undefined;
    
    if (isError(errorOrMessage)) {
      message = errorOrMessage.message;
      originalError = errorOrMessage;
    } else {
      message = String(errorOrMessage);
      originalError = undefined;
    }
    
    const appError = createStandardError(message, {
      ...options,
      originalError
    });
    
    logError(appError);
    showErrorToUser(appError);
    
    return appError;
  }, [logError, showErrorToUser]);

  // Create error
  const createError = useCallback((
    message: string,
    options?: Partial<AppError>
  ): AppError => {
    return createStandardError(message, options);
  }, []);

  // Wrap promise
  const wrapPromise = useCallback(<T>(
    promise: Promise<T>,
    options?: Partial<AppError>
  ): Promise<T> => {
    return promise.catch(error => {
      captureError(isError(error) ? error : String(error), options);
      throw error;
    });
  }, [captureError]);

  // Higher-order function for error handling
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: Partial<AppError>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        captureError(isError(error) ? error : String(error), options);
        throw error;
      }
    };
  }, [captureError]);

  // Context value
  const value: ErrorHandlerContextValue = {
    captureError,
    logError,
    showErrorToUser,
    dismissError,
    wrapPromise,
    createError,
    currentError,
    hasError: currentError !== null,
    clearErrors,
    withErrorHandling
  };

  return (
    <ErrorHandlerContext.Provider value={value}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

// Hook to use error handler
export const useErrorHandler = (): ErrorHandlerContextValue => {
  const context = useContext(ErrorHandlerContext);
  
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorHandlerProvider');
  }
  
  return context;
};

// HOC to wrap components with error handling
export const withErrorHandler = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithErrorHandler = (props: P) => (
    <ErrorHandlerProvider>
      <Component {...props} />
    </ErrorHandlerProvider>
  );
  
  WithErrorHandler.displayName = `WithErrorHandler(${Component.displayName || Component.name || 'Component'})`;
  
  return WithErrorHandler;
};

// ErrorBoundary component
export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode | ((error: AppError) => ReactNode) },
  { hasError: boolean; error: AppError | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode | ((error: AppError) => ReactNode) }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: AppError } {
    const appError = createStandardError(error.message, {
      originalError: error,
      source: ErrorSource.CLIENT,
      category: ErrorCategory.RENDERING
    });
    
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function' && exists(this.state.error)) {
        return this.props.fallback(this.state.error);
      }
      
      return this.props.fallback || (
        <div role="alert" className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An error occurred'}</p>
        </div>
      );
    }

    return this.props.children;
  }
} 