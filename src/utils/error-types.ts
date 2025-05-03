/**
 * Error severity levels for application error handling
 */
export enum ErrorSeverity {
  INFO = 'info', // Informational messages, not true errors
  WARNING = 'warning', // Minor issues that don't break functionality
  ERROR = 'error', // Standard errors that affect functionality
  CRITICAL = 'critical', // Serious errors that prevent core features
  FATAL = 'fatal', // Catastrophic errors that crash the application
}

/**
 * Error sources to categorize where errors occur
 */
export enum ErrorSource {
  UI = 'ui', // User interface errors

  API = 'api', // API request/response errors
  DATABASE = 'database', // Database operations errors

  AUTH = 'auth', // Authentication/authorization errors
  VALIDATION = 'validation', // Input validation errors
  EXTERNAL = 'external', // Errors from external services
  UNKNOWN = 'unknown', // Unclassified errors
}

/**
 * Error categories to classify the type of error
 */
export enum ErrorCategory {
  NETWORK = 'network', // Network connectivity issues

  AUTHENTICATION = 'auth', // Login/session problems
  AUTHORIZATION = 'authz', // Permission issues
  DATA_SUBMISSION = 'submit', // Form submission errors
  DATA_FETCHING = 'fetch', // Data retrieval errors
  USER_INPUT = 'input', // Invalid user input
  RENDERING = 'render', // UI rendering problems
  RESOURCE_ACCESS = 'resource', // Resource availability issues
  TIMEOUT = 'timeout', // Operation timeout
  UNKNOWN = 'unknown', // Unclassified errors
}

/**
 * Interface for capturing error information with metadata
 */
export interface ErrorInfo {
  source: ErrorSource;
  category: ErrorCategory;
  severity: ErrorSeverity;
  metadata?: Record<string, any>;
  errorId?: string;
  timestamp?: string;
}

/**
 * Interface for an API error response
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  details?: any;
  code?: string;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public info: ErrorInfo;

  constructor(message: string, info: ErrorInfo) {
    super(message);
    this?.name = 'AppError';
    this?.info = {
      ...info,
      timestamp: new Date().toISOString(),
      errorId: generateErrorId(),
    };
  }
}

/**
 * Generate a unique error ID for tracking purposes
 */
function generateErrorId(): string {
  return Math?.random().toString(36).substring(2, 12);
}
