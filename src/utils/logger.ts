type LogLevel = 'info' | 'warn' | 'error' | 'security';

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

  private constructor() {}

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
      metadata
    };
  }

  private log(entry: LogEntry) {
    // Add to memory store (with rotation)
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, {
        userId: entry.userId,
        ...entry.metadata
      });
    }

    // In production, you might want to send logs to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement production logging service integration
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

  security(message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.log(this.createLogEntry('security', message, userId, metadata));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = Logger.getInstance(); 