
import { ApiError } from '@/types/api';

/**
 * Custom API error class
 */
export class ApiRequestError extends Error {
  public code: string;
  public details?: Record<string, any>;
  public status: number;

  constructor(error: ApiError, status: number = 500) {
    super(error?.message);
    this?.name = 'ApiRequestError';
    this?.code = error?.code;
    this?.details = error?.details;
    this?.status = status;
  }
}

/**
 * Network error class
 */
export class NetworkError extends Error {
  public status: number;

  constructor(message: string = 'Network error occurred', status: number = 0) {
    super(message);
    this?.name = 'NetworkError';
    this?.status = status;
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this?.name = 'TimeoutError';
  }
}

/**
 * Parse error response from API
 */
export function parseApiError(error: any): ApiError {
  if (error instanceof ApiRequestError) {
    return {
      code: error?.code,
      message: error?.message,
      details: error?.details,
    };
  }

  if (error instanceof NetworkError) {
    return {
      code: 'NETWORK_ERROR',
      message: error?.message,
    };
  }

  if (error instanceof TimeoutError) {
    return {
      code: 'TIMEOUT_ERROR',
      message: error?.message,
    };
  }

  // Handle unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: error?.message || 'An unknown error occurred',
    details: error?.details,
  };
}

/**
 * Create an API error object
 */
export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
): ApiError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof error?.code === 'string' &&
    typeof error?.message === 'string'
  );
}

/**
 * Error codes mapping
 */
export {};

/**
 * HTTP status codes mapping
 */
export {};
