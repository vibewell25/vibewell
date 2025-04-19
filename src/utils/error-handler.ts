// TypeScript helper for handling errors with React components
// This file handles errors in a standardized way throughout the application

import * as React from 'react';
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
  wrapPromise: <PromiseType>(promise: Promise<PromiseType>, options?: Partial<AppError>) => Promise<PromiseType>;
  createError: (message: string, options?: Partial<AppError>) => AppError;
  currentError: AppError | null;
  hasError: boolean;
  clearErrors: () => void;
  withErrorHandling: <ArgsType extends any[], ReturnType>(
    fn: (...args: ArgsType) => Promise<ReturnType>,
    options?: Partial<AppError>
  ) => (...args: ArgsType) => Promise<ReturnType>;
}

// Create context
const ErrorHandlerContext = React.createContext<ErrorHandlerContextValue | undefined>(undefined);

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
  const [currentError, setCurrentError] = React.useState<AppError | null>(null);

  // Log error
  const logError = React.useCallback((error: AppError) => {
    console.error(
      `[${error.severity}][${error.source}][${error.category}]: ${error.message}`,
      { error }
    );
    
    if (logToServer) {
      logToServer(error).catch((serverLogError: Error) => 
        console.error('Error logging to server:', serverLogError)
      );
    }
  }, [logToServer]);

  // Show error
  const showErrorToUser = React.useCallback((error: AppError) => {
    setCurrentError(error);
    if (exists(onError)) {
      onError(error);
    }
  }, [onError]);

  // Dismiss error
  const dismissError = React.useCallback(() => {
    setCurrentError(null);
  }, []);

  // Clear errors
  const clearErrors = React.useCallback(() => {
    setCurrentError(null);
  }, []);

  // Capture error
  const captureError = React.useCallback((
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
  const createError = React.useCallback((
    message: string,
    options?: Partial<AppError>
  ): AppError => {
    return createStandardError(message, options);
  }, []);

  // Wrap promise with error handling
  function wrapPromiseFn<PromiseType>(
    promise: Promise<PromiseType>, 
    options?: Partial<AppError>
  ): Promise<PromiseType> {
    return promise.catch(error => {
      captureError(isError(error) ? error : String(error), options);
      throw error;
    });
  }
  
  const wrapPromise = React.useCallback(wrapPromiseFn, [captureError]);

  // Higher-order function for error handling
  function errorHandlingHOF<ArgsType extends any[], ReturnType>(
    fn: (...args: ArgsType) => Promise<ReturnType>,
    options?: Partial<AppError>
  ): (...args: ArgsType) => Promise<ReturnType> {
    return async (...args: ArgsType): Promise<ReturnType> => {
      try {
        return await fn(...args);
      } catch (error) {
        captureError(isError(error) ? error : String(error), options);
        throw error;
      }
    };
  }
  
  const withErrorHandling = React.useCallback(errorHandlingHOF, [captureError]);

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

  return React.createElement(
    ErrorHandlerContext.Provider,
    { value },
    children
  );
};

// Hook to use error handler
export const useErrorHandler = (): ErrorHandlerContextValue => {
  const context = React.useContext(ErrorHandlerContext);
  
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorHandlerProvider');
  }
  
  return context;
};

// HOC to wrap components with error handling
export function withErrorHandler<PropTypes extends object>(
  Component: React.ComponentType<PropTypes>
): React.FC<PropTypes> {
  const WithErrorHandler: React.FC<PropTypes> = (props: PropTypes) => 
    React.createElement(
      ErrorHandlerProvider,
      { children: React.createElement(Component, props) } as ErrorHandlerProviderProps,
      null
    );
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorHandler.displayName = `withErrorHandler(${displayName})`;
  
  return WithErrorHandler;
}

// Error fallback function type
export type ErrorFallbackFunction = (error: AppError) => React.ReactNode;

// Props for the error boundary component
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackFn?: ErrorFallbackFunction;
  onError?: (error: AppError) => void;
}

// State interface for error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

// Error boundary component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Create a standard error from the caught error
    const appError = createStandardError(error.message, {
      originalError: error,
      source: ErrorSource.CLIENT,
      category: ErrorCategory.RENDERING
    });
    
    return { hasError: true, error: appError };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error);
    }
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallbackFn && this.state.error) {
        return this.props.fallbackFn(this.state.error);
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return React.createElement(
        'div',
        { 
          style: { 
            padding: '20px', 
            margin: '20px', 
            border: '1px solid #f5c6cb', 
            borderRadius: '4px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24'
          } 
        },
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('p', null, this.state.error?.message || 'An unknown error occurred'),
        React.createElement(
          'button',
          { 
            onClick: () => this.setState({ hasError: false, error: null }), 
            style: { 
              padding: '8px 16px', 
              backgroundColor: '#721c24', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            } 
          },
          'Try again'
        )
      );
    }
    
    return this.props.children;
  }
} 