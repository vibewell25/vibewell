import * as Sentry from '@sentry/nextjs';
import winston from 'winston';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

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
    if (process.env['NODE_ENV'] !== 'production') {
      return;
    }

    // Initialize Sentry if not already initialized
    if (!this.sentryInitialized && process.env['NEXT_PUBLIC_SENTRY_DSN']) {
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
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        defaultMeta: { service: 'vibewell-app' },
        transports: [
          // Console transport for server logs
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ],
      });

      // Add file transport if file logging is enabled
      if (process.env['ENABLE_FILE_LOGGING'] === 'true') {
        this.winstonLogger.add(
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          })
        );
        
        this.winstonLogger.add(
          new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          })
        );
      }
    } catch (error) {
      console.error('Failed to initialize Winston logger:', error);
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      userId,
      metadata,
    };
  }

  private log(entry: LogEntry) {
    // Add to memory store (with rotation)
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, {
        userId: entry.userId,
        ...entry.metadata,
      });
    }

    // In production, send logs to services
    if (process.env['NODE_ENV'] === 'production') {
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

  info(message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.log(this.createLogEntry('info', message, userId, metadata));
  }

  warn(message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.log(this.createLogEntry('warn', message, userId, metadata));
  }

  error(message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.log(this.createLogEntry('error', message, userId, metadata));
  }

  debug(message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.log(this.createLogEntry('debug', message, userId, metadata));
  }

  security(message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.log(this.createLogEntry('security', message, userId, metadata));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = Logger.getInstance();
