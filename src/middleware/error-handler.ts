/**
 * Enhanced error handling middleware for API routes
 * 
 * This middleware provides consistent error handling and prevents
 * information disclosure in error messages.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import logger from '../utils/logger';

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}

// Error codes to user-friendly messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credentials': 'Invalid email or password',
  'auth/user-not-found': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/email-already-in-use': 'This email is already registered',
  'auth/invalid-email': 'Please provide a valid email address',
  'auth/weak-password': 'Password is too weak',
  'auth/not-authorized': 'You do not have permission to perform this action',
  'data/not-found': 'The requested resource was not found',
  'data/validation-failed': 'Please check your input and try again',
  'server/database-error': 'A database error occurred',
  'server/unknown-error': 'An unexpected error occurred',
  'rate-limit/exceeded': 'Too many requests, please try again later',
};

// Default error message to show to users
const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again later.';

/**
 * Get a user-friendly error message based on error code
 * 
 * @param code The error code
 * @param isProduction Whether the application is running in production
 * @param message The original error message
 * @returns A sanitized error message safe to show to users
 */
export function getSafeErrorMessage(code: string, isProduction: boolean, message?: string): string {
  // In development, we can show more details
  if (!isProduction && message) {
    return message;
  }
  
  // In production, only return mapped messages or default
  return ERROR_MESSAGES[code] || DEFAULT_ERROR_MESSAGE;
}

/**
 * Middleware to handle errors in API routes
 * 
 * @param err The error object
 * @param req The request object
 * @param res The response object
 */
export function errorHandler(
  err: any,
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  const isProduction = process.env.NODE_ENV === 'production';
  const errorCode = err.code || 'server/unknown-error';
  const statusCode = err.statusCode || 500;
  
  // Log the full error details for debugging (but not sensitive info)
  logger.error({
    code: errorCode,
    path: req.url,
    method: req.method,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });
  
  // Return a sanitized error to the client
  res.status(statusCode).json({
    error: {
      message: getSafeErrorMessage(errorCode, isProduction, err.message),
      code: isProduction ? undefined : errorCode,
    }
  });
}

/**
 * Wrapper for API handlers with automatic error handling
 * 
 * @param handler The API route handler function
 * @returns A wrapped handler with error handling
 */
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error, req, res);
    }
  };
} 