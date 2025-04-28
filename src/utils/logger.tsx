/**
 * Application Logger
 *
 * This module provides a unified logging interface for the application.
 * In production, it could be configured to use a logging service like Winston
 * or ship logs to a remote service.
 */

interface LogPayload {
  message?: string;
  [key: string]: any;
}

/**
 * Sanitize sensitive data from log entries
 *
 * @param data The data object to sanitize
 * @returns Sanitized data safe for logging
 */
function sanitizeLogData<T extends object>(data: T): T {
  // Create a deep copy to avoid modifying the original
  const result = JSON.parse(JSON.stringify(data)) as T;

  // List of sensitive fields to mask
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'credentials',
    'credit_card',
    'creditCard',
    'ssn',
    'email',
    'phone',
    'address',
    'apiKey',
    'api_key',
    'authorization',
    'auth',
  ];

  // Recursively mask sensitive values
  function maskSensitiveData(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      // Check if this is a sensitive key
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        if (typeof obj[key] === 'string') {
          obj[key] = '***REDACTED***';
        }
      } else if (typeof obj[key] === 'object') {
        // Recurse into nested objects
        maskSensitiveData(obj[key]);
      }
    }
  }

  maskSensitiveData(result);
  return result;
}

/**
 * Format log entries consistently
 *
 * @param level Log level
 * @param payload Log data
 * @returns Formatted log object
 */
function formatLog(level: string, payload: LogPayload | string): object {
  const timestamp = new Date().toISOString();
  const data = typeof payload === 'string' ? { message: payload } : payload;

  return {
    level,
    timestamp,
    ...sanitizeLogData(data),
  };
}

/**
 * Logger implementation
 */
const logger = {
  /**
   * Log debug information
   */
  debug(payload: LogPayload | string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify(formatLog('debug', payload)));
    }
  },

  /**
   * Log informational messages
   */
  info(payload: LogPayload | string): void {
    console.info(JSON.stringify(formatLog('info', payload)));
  },

  /**
   * Log warning messages
   */
  warn(payload: LogPayload | string): void {
    console.warn(JSON.stringify(formatLog('warn', payload)));
  },

  /**
   * Log error messages
   */
  error(payload: LogPayload | string): void {
    console.error(JSON.stringify(formatLog('error', payload)));
  },
};

export default logger;
