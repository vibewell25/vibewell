import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast } from '../components/ui/use-toast';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

// Error source types
export enum ErrorSource {
  UI = 'ui',
  API = 'api',
  DATABASE = 'database',
  NETWORK = 'network',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

// Error categorization
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RESOURCE_NOT_FOUND = 'resource_not_found',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// Standard error structure with metadata
export interface AppError {
  message: string;
  code?: string;
  source: ErrorSource;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  originalError?: Error;
  metadata?: Record<string, any>;
  retry?: () => Promise<any>;
  handled?: boolean;
}

// Error handler context
interface ErrorHandlerContextType {
  captureError: (error: Error | string, options?: Partial<AppError>) => AppError;
  logError: (error: AppError) => void;
  showErrorToUser: (error: AppError) => void;
  clearErrors: () => void;
  getRecentErrors: () => AppError[];
  trackError: (error: AppError) => void;
  withErrorHandling: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: Partial<AppError>
  ) => (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

// Create context with default values
const ErrorHandlerContext = createContext<ErrorHandlerContextType>({
  captureError: () => ({
    message: 'Error handler not initialized',
    source: ErrorSource.UNKNOWN,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.ERROR,
    timestamp: Date.now(),
    handled: false
  }),
  logError: () => {},
  showErrorToUser: () => {},
  clearErrors: () => {},
  getRecentErrors: () => [],
  trackError: () => {},
  withErrorHandling: fn => fn
});

// Maximum number of errors to retain in memory
const MAX_ERROR_HISTORY = 100;

// Provider component for error handling
export const ErrorHandlerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Store recent errors for analysis and debugging
  const [recentErrors, setRecentErrors] = React.useState<AppError[]>([]);

  // Create a standardized error object
  const captureError = useCallback((error: Error | string, options: Partial<AppError> = {}): AppError => {
    const message = typeof error === 'string' ? error : error.message;
    const timestamp = Date.now();
    
    const appError: AppError = {
      message,
      code: options.code,
      source: options.source || ErrorSource.UNKNOWN,
      category: options.category || ErrorCategory.UNKNOWN,
      severity: options.severity || ErrorSeverity.ERROR,
      timestamp,
      originalError: typeof error === 'string' ? undefined : error,
      metadata: options.metadata || {},
      retry: options.retry,
      handled: false
    };
    
    return appError;
  }, []);

  // Log error to console and potentially to an error tracking service
  const logError = useCallback((error: AppError) => {
    const { severity, source, category, message, code, metadata, originalError } = error;
    
    console.group(`[${severity.toUpperCase()}] ${source}/${category}`);
    console.error(message);
    if (code) console.error(`Error code: ${code}`);
    if (metadata && Object.keys(metadata).length > 0) console.table(metadata);
    if (originalError) console.error(originalError);
    console.groupEnd();
    
    // Add to recent errors
    setRecentErrors(prev => {
      const updated = [error, ...prev];
      // Limit the number of stored errors
      return updated.slice(0, MAX_ERROR_HISTORY);
    });
    
    error.handled = true;
  }, []);

  // Display error to user via toast or other UI mechanism
  const showErrorToUser = useCallback((error: AppError) => {
    const { severity, message } = error;
    
    // Map severity to toast variant
    const variant = 
      severity === ErrorSeverity.INFO ? 'default' :
      severity === ErrorSeverity.WARNING ? 'warning' :
      severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.FATAL ? 'destructive' :
      'error';
    
    toast({
      title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} occurred`,
      description: message,
      variant
    });
    
    error.handled = true;
  }, []);

  // Clear error history
  const clearErrors = useCallback(() => {
    setRecentErrors([]);
  }, []);

  // Get recent errors for analysis
  const getRecentErrors = useCallback(() => {
    return [...recentErrors];
  }, [recentErrors]);

  // Track errors with analytics service
  const trackError = useCallback((error: AppError) => {
    // Here you would typically send the error to an analytics or monitoring service
    // For example: analytics.trackEvent('error', { ...error });
    if (window.analyticsService) {
      window.analyticsService.trackEvent('error_captured', {
        message: error.message,
        code: error.code,
        source: error.source,
        category: error.category,
        severity: error.severity,
        timestamp: error.timestamp,
        metadata: error.metadata
      });
    }
  }, []);

  // Higher-order function to wrap async functions with error handling
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: Partial<AppError> = {}
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args);
      } catch (error) {
        const appError = captureError(error as Error, options);
        logError(appError);
        
        // Show error to user if it's significant enough
        if (
          appError.severity === ErrorSeverity.ERROR ||
          appError.severity === ErrorSeverity.CRITICAL ||
          appError.severity === ErrorSeverity.FATAL
        ) {
          showErrorToUser(appError);
        }
        
        // Track error for analytics
        trackError(appError);
        
        // Rethrow to allow parent components to handle
        throw appError;
      }
    };
  }, [captureError, logError, showErrorToUser, trackError]);

  const contextValue: ErrorHandlerContextType = {
    captureError,
    logError,
    showErrorToUser,
    clearErrors,
    getRecentErrors,
    trackError,
    withErrorHandling
  };

  return (
    <ErrorHandlerContext.Provider value={contextValue}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

// Custom hook for using the error handler
export const useErrorHandler = () => useContext(ErrorHandlerContext);

// Helper function to create error objects with standard properties
export function createAppError(
  message: string,
  options: Partial<Omit<AppError, 'message' | 'timestamp'>> = {}
): AppError {
  return {
    message,
    code: options.code,
    source: options.source || ErrorSource.UNKNOWN,
    category: options.category || ErrorCategory.UNKNOWN,
    severity: options.severity || ErrorSeverity.ERROR,
    timestamp: Date.now(),
    originalError: options.originalError,
    metadata: options.metadata || {},
    retry: options.retry,
    handled: false
  };
}

// Helper function to transform API errors to app errors
export function transformApiError(error: any): AppError {
  // Handle Axios errors
  if (error.isAxiosError) {
    const status = error.response?.status;
    
    let category = ErrorCategory.UNKNOWN;
    if (status === 401) category = ErrorCategory.AUTHENTICATION;
    else if (status === 403) category = ErrorCategory.AUTHORIZATION;
    else if (status === 404) category = ErrorCategory.RESOURCE_NOT_FOUND;
    else if (status === 408) category = ErrorCategory.TIMEOUT;
    else if (status >= 400 && status < 500) category = ErrorCategory.CLIENT;
    else if (status >= 500) category = ErrorCategory.SERVER;
    
    return createAppError(
      error.response?.data?.message || error.message || 'API request failed',
      {
        code: `HTTP_${status}`,
        source: ErrorSource.API,
        category,
        severity: status >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
        originalError: error,
        metadata: {
          url: error.config?.url,
          method: error.config?.method,
          status,
          statusText: error.response?.statusText
        }
      }
    );
  }
  
  // Handle fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createAppError(
      'Network request failed',
      {
        source: ErrorSource.NETWORK,
        category: ErrorCategory.TIMEOUT,
        severity: ErrorSeverity.WARNING,
        originalError: error
      }
    );
  }
  
  // Handle generic errors
  return createAppError(
    error.message || 'An unexpected error occurred',
    {
      source: ErrorSource.UNKNOWN,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      originalError: error
    }
  );
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  onError?: (error: Error, info: React.ErrorInfo) => void
) {
  return class ErrorBoundaryWrapper extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
      if (onError) {
        onError(error, info);
      }
    }

    render() {
      if (this.state.hasError) {
        return fallback || (
          <div className="error-boundary-fallback">
            <h2>Something went wrong.</h2>
            <button 
              className="reset-button"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}

// Export all components and utilities
export default {
  ErrorHandlerProvider,
  useErrorHandler,
  createAppError,
  transformApiError,
  withErrorBoundary,
  ErrorSeverity,
  ErrorSource,
  ErrorCategory
}; 