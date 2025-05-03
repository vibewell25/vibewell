import * as Sentry from '@sentry/nextjs';
import winston from 'winston';
import type { FC, PropsWithChildren, Context } from 'react';

/**
 * Unified Application Logger
 *
 * This module provides a comprehensive logging interface for the application,
 * combining functionality from multiple logger implementations.
 * 
 * Features:
 * - In-memory log storage
 * - Production logging through Winston
 * - Error tracking with Sentry
 * - Sensitive data sanitization
 * - Consistent log format
 */

// Types definitions
export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'security';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface LogPayload {
  message?: string;
  [key: string]: any;
}

/**
 * Sanitize sensitive data from log entries
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
 * @param level Log level
 * @param payload Log data
 * @returns Formatted log object
 */
function formatLog(level: LogLevel, payload: LogPayload | string): object {
  const timestamp = new Date().toISOString();
  const data = typeof payload === 'string' ? { message: payload } : payload;

  return {
    level,
    timestamp,
    ...sanitizeLogData(data),
  };
}

/**
 * Main Logger class providing comprehensive logging functionality
 */
class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private winstonLogger: winston.Logger | null = null;
  private sentryInitialized: boolean = false;

  private constructor() {
    this.initProductionLogger();
  }

  private initProductionLogger() {
    if (process?.env['NODE_ENV'] !== 'production') {
      return;
    }

    // Initialize Sentry if not already initialized
    if (!this.sentryInitialized && process?.env['NEXT_PUBLIC_SENTRY_DSN']) {
      try {
        this.sentryInitialized = true;
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
    }

    // Initialize Winston logger for production
    try {
      // Create Winston logger with console and file transports
      this.winstonLogger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: { service: 'vibewell-app' },
        transports: [
          // Console transport for server logs
          new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
          }),
        ],
      });

      // Add file transport if file logging is enabled
      if (process?.env['ENABLE_FILE_LOGGING'] === 'true') {
        this.winstonLogger.add(
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        );

        this.winstonLogger.add(
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to initialize Winston logger:', error);
    }
  }

  /**
   * Get the singleton instance of the logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    userId?: string,
    metadata?: Record<string, unknown>,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      userId,
      metadata: metadata ? sanitizeLogData(metadata) : undefined,
    };
  }

  private log(entry: LogEntry) {
    // Add to memory store (with rotation)
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log to console in development
    if (process?.env['NODE_ENV'] === 'development') {
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, {
        userId: entry.userId,
        ...entry.metadata,
      });
    }

    // In production, send logs to services
    if (process?.env['NODE_ENV'] === 'production') {
      this.logToProductionServices(entry);
    }
  }

  private logToProductionServices(entry: LogEntry) {
    // Log to Winston if available
    if (this.winstonLogger) {
      this.winstonLogger.log(entry.level, entry.message, {
        userId: entry.userId,
        ...entry.metadata,
      });
    }

    // Log to Sentry for error and security levels
    if (this.sentryInitialized && (entry.level === 'error' || entry.level === 'security')) {
      Sentry.withScope((scope) => {
        // Add user context if available
        if (entry.userId) {
          scope.setUser({ id: entry.userId });
        }

        // Add extra metadata
        if (entry.metadata) {
          Object.entries(entry.metadata).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        // Set the log level on Sentry
        scope.setLevel(this.mapLogLevelToSentry(entry.level));

        // Capture message or exception
        if (entry.metadata?.error instanceof Error) {
          Sentry.captureException(entry.metadata.error);
        } else {
          Sentry.captureMessage(entry.message);
        }
      });
    }
  }

  private mapLogLevelToSentry(level: LogLevel): Sentry.SeverityLevel {
    switch (level) {
      case 'error':
        return 'error';
      case 'security':
        return 'fatal';
      case 'warn':
        return 'warning';
      case 'debug':
        return 'debug';
      case 'info':
      default:
        return 'info';
    }
  }

  /**
   * Log debug information
   */
  debug(message: string, userId?: string, metadata?: Record<string, unknown>): void;
  debug(payload: LogPayload): void;
  debug(messageOrPayload: string | LogPayload, userId?: string, metadata?: Record<string, unknown>) {
    if (typeof messageOrPayload === 'string') {
      this.log(this.createLogEntry('debug', messageOrPayload, userId, metadata));
    } else {
      const { message = 'Debug log', ...rest } = messageOrPayload;
      this.log(this.createLogEntry('debug', message, undefined, rest));
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, userId?: string, metadata?: Record<string, unknown>): void;
  info(payload: LogPayload): void;
  info(messageOrPayload: string | LogPayload, userId?: string, metadata?: Record<string, unknown>) {
    if (typeof messageOrPayload === 'string') {
      this.log(this.createLogEntry('info', messageOrPayload, userId, metadata));
    } else {
      const { message = 'Info log', ...rest } = messageOrPayload;
      this.log(this.createLogEntry('info', message, undefined, rest));
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, userId?: string, metadata?: Record<string, unknown>): void;
  warn(payload: LogPayload): void;
  warn(messageOrPayload: string | LogPayload, userId?: string, metadata?: Record<string, unknown>) {
    if (typeof messageOrPayload === 'string') {
      this.log(this.createLogEntry('warn', messageOrPayload, userId, metadata));
    } else {
      const { message = 'Warning log', ...rest } = messageOrPayload;
      this.log(this.createLogEntry('warn', message, undefined, rest));
    }
  }

  /**
   * Log error messages
   */
  error(message: string, userId?: string, metadata?: Record<string, unknown>): void;
  error(payload: LogPayload): void;
  error(messageOrPayload: string | LogPayload, userId?: string, metadata?: Record<string, unknown>) {
    if (typeof messageOrPayload === 'string') {
      this.log(this.createLogEntry('error', messageOrPayload, userId, metadata));
    } else {
      const { message = 'Error log', ...rest } = messageOrPayload;
      this.log(this.createLogEntry('error', message, undefined, rest));
    }
  }

  /**
   * Log security-related messages
   */
  security(message: string, userId?: string, metadata?: Record<string, unknown>): void;
  security(payload: LogPayload): void;
  security(messageOrPayload: string | LogPayload, userId?: string, metadata?: Record<string, unknown>) {
    if (typeof messageOrPayload === 'string') {
      this.log(this.createLogEntry('security', messageOrPayload, userId, metadata));
    } else {
      const { message = 'Security log', ...rest } = messageOrPayload;
      this.log(this.createLogEntry('security', message, undefined, rest));
    }
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

// Create and export the singleton logger instance
const logger = Logger.getInstance();
export default logger;

// Types for React context (to be used in a separate file)
export type LoggerContextType = typeof logger;
export type LoggerProviderProps = PropsWithChildren<{}>;
