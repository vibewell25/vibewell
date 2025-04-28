/**
 * Unified Error Tracking Service
 *
 * This service provides centralized error logging, tracking, and handling
 * for both client and server-side errors in the Vibewell application.
 */

// Error Severity Levels
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

// Error Categories
export enum ErrorCategory {
  API = 'api',
  UI = 'ui',
  DATA = 'data',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  RENDERING = 'rendering',
  RESOURCE = 'resource',
  THIRD_PARTY = 'third-party',
  AR = 'ar',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown',
}

// Error Context Interface
export interface ErrorContext {
  userId?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
  browserInfo?: {
    userAgent: string;
    language: string;
    vendor: string;
    platform: string;
    screenSize: {
      width: number;
      height: number;
    };
  };
}

// Error Options Interface
export interface ErrorOptions {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  context?: ErrorContext;
  originalError?: Error;
  stack?: string;
  isSilent?: boolean;
  shouldRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// AppError class to standardize error structure
export class AppError extends Error {
  public severity: ErrorSeverity;
  public category: ErrorCategory;
  public context?: ErrorContext;
  public originalError?: Error;
  public isSilent: boolean;
  public shouldRetry: boolean;
  public retryCount: number;
  public maxRetries: number;
  public uniqueId: string;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.context = options.context || {};
    this.originalError = options.originalError;
    this.isSilent = options.isSilent || false;
    this.shouldRetry = options.shouldRetry || false;
    this.retryCount = options.retryCount || 0;
    this.maxRetries = options.maxRetries || 3;
    this.uniqueId = generateErrorId();

    // Add timestamp if not provided
    if (!this.context.timestamp) {
      this.context.timestamp = Date.now();
    }

    // Capture stack trace
    if (options.stack) {
      this.stack = options.stack;
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // Capture browser info if client-side
    if (typeof window !== 'undefined' && !this.context.browserInfo) {
      this.context.browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        vendor: navigator.vendor,
        platform: navigator.platform,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      severity: this.severity,
      category: this.category,
      context: this.context,
      stack: this.stack,
      uniqueId: this.uniqueId,
    };
  }
}

// Generate unique error ID
function generateErrorId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Function to extract browser and device info
export function getBrowserInfo(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    vendor: navigator.vendor,
    platform: navigator.platform,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    pixelRatio: window.devicePixelRatio,
    connection: navigator.connection
      ? {
          effectiveType: (navigator.connection as any).effectiveType,
          downlink: (navigator.connection as any).downlink,
          rtt: (navigator.connection as any).rtt,
        }
      : undefined,
  };
}

// Error tracking service
class ErrorTrackingService {
  private isInitialized = false;
  private errorHandler?: (error: AppError) => void;
  private consoleErrorOriginal: typeof console.error = console.error;
  private queuedErrors: AppError[] = [];
  private debugMode = false;

  // Initialize the error tracking service
  public init(
    options: {
      errorHandler?: (error: AppError) => void;
      captureConsoleErrors?: boolean;
      capturePromiseRejections?: boolean;
      captureWindowErrors?: boolean;
      debug?: boolean;
    } = {},
  ) {
    if (this.isInitialized) return;

    this.errorHandler = options.errorHandler;
    this.debugMode = options.debug || false;

    // Replace the console.error method if requested
    if (options.captureConsoleErrors && typeof window !== 'undefined') {
      console.error = (...args: any[]) => {
        this.consoleErrorOriginal.apply(console, args);
        this.captureConsoleError(args);
      };
    }

    // Capture unhandled promise rejections
    if (options.capturePromiseRejections && typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          context: {
            action: 'unhandled_promise_rejection',
          },
          originalError: event.reason instanceof Error ? event.reason : undefined,
        });
      });
    }

    // Capture window errors
    if (options.captureWindowErrors && typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || event.message, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          context: {
            action: 'window_error',
            metadata: {
              lineNo: event.lineno,
              colNo: event.colno,
              filename: event.filename,
            },
          },
          originalError: event.error,
        });
      });
    }

    this.isInitialized = true;

    // Process any queued errors
    if (this.queuedErrors.length > 0) {
      this.processQueuedErrors();
    }
  }

  // Capture and track an error
  public captureError(error: Error | string, options: ErrorOptions = {}): AppError {
    const message = typeof error === 'string' ? error : error.message;
    const appError = new AppError(message, {
      ...options,
      originalError: typeof error === 'string' ? undefined : error,
      stack: typeof error !== 'string' ? error.stack : undefined,
    });

    if (!this.isInitialized) {
      // Queue error for later if not initialized
      this.queuedErrors.push(appError);
    } else {
      this.trackError(appError);
    }

    return appError;
  }

  // Process queued errors after initialization
  private processQueuedErrors() {
    for (const error of this.queuedErrors) {
      this.trackError(error);
    }
    this.queuedErrors = [];
  }

  // Track an AppError
  private trackError(error: AppError) {
    if (this.debugMode) {
      this.consoleErrorOriginal('[ErrorTrackingService]', error);
    }

    if (this.errorHandler) {
      try {
        this.errorHandler(error);
      } catch (handlerError) {
        this.consoleErrorOriginal('[ErrorTrackingService] Error in error handler:', handlerError);
      }
    }

    // In a real app, you would send this to a monitoring service like Sentry
    // This is just a placeholder implementation
    if (process.env.NODE_ENV === 'production' && !error.isSilent) {
      // example: sendErrorToMonitoringService(error);
    }
  }

  // Capture errors from console.error
  private captureConsoleError(args: any[]) {
    // Extract meaningful info from console.error arguments
    const errorMessage = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');

    const error = args.find((arg) => arg instanceof Error);
    if (error) {
      this.captureError(error, {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.UNKNOWN,
        context: {
          action: 'console_error',
        },
      });
    } else {
      this.captureError(errorMessage, {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.UNKNOWN,
        context: {
          action: 'console_error',
        },
      });
    }
  }

  // Report exception from try/catch blocks or error boundaries
  public reportException(error: Error | unknown, context?: Partial<ErrorContext>): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
      // Update context if provided
      if (context) {
        appError.context = { ...appError.context, ...context };
      }
    } else if (error instanceof Error) {
      appError = this.captureError(error, {
        severity: ErrorSeverity.HIGH,
        context,
      });
    } else {
      const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';

      appError = this.captureError(errorMessage, {
        severity: ErrorSeverity.HIGH,
        context,
      });
    }

    return appError;
  }

  // Create a wrapper for async functions to auto-catch and report errors
  public wrapAsync<T>(fn: () => Promise<T>, options: ErrorOptions = {}): Promise<T> {
    return fn().catch((error) => {
      this.captureError(error, options);
      throw error; // Re-throw to maintain the same behavior
    });
  }
}

// Create a singleton instance
export const errorTrackingService = new ErrorTrackingService();

// React hook for error reporting within components
export function useErrorTracking() {
  return {
    reportError: (error: Error | string, options: ErrorOptions = {}) =>
      errorTrackingService.captureError(error, options),
    trackAction: (action: string, fn: () => void) => {
      try {
        fn();
      } catch (error) {
        errorTrackingService.captureError(error as Error, {
          context: { action },
        });
        throw error;
      }
    },
    trackPromise: <T>(action: string, promise: Promise<T>) =>
      promise.catch((error) => {
        errorTrackingService.captureError(error, {
          context: { action },
        });
        throw error;
      }),
  };
}

// Export a function to initialize the error tracking
export function initErrorTracking(options = {}) {
  errorTrackingService.init(options);
}

// Export a convenience function for tracking errors
export function trackError(error: Error | string, options: ErrorOptions = {}) {
  return errorTrackingService.captureError(error, options);
}
