/**
 * Logger Utility
 *
 * This module provides a configurable logger for the application, with special
 * support for rate limiting events and security-related logging.
 */

import { createHash } from 'crypto';
import winston, { LogEntry } from 'winston';

// Define types for log levels and events
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interface for log events
interface LogEvent {
  message: string;
  module?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Interface for rate limit events
interface RateLimitEvent {
  ip: string;
  userId?: string;
  path: string;
  rateLimiter: string;
  exceeded: boolean;
  remaining?: number;
  resetTime?: number;
}

// Alert thresholds for rate limiting
const ALERT_THRESHOLDS = {
  CONSECUTIVE_FAILURES: 5, // Alert after 5 consecutive rate limit hits
  TIME_WINDOW_MS: 60 * 1000, // 1 minute window for tracking suspicious activity
  IP_THRESHOLD: 10, // Alert if same IP hits rate limits 10 times in a minute
  PATH_THRESHOLD: 15, // Alert if same path hits rate limits 15 times in a minute
  USER_THRESHOLD: 7, // Alert if same user hits rate limits 7 times in a minute
};

// In-memory store for tracking rate limit events for alerting
// In production, you would use Redis or another distributed store
class RateLimitTracker {
  private ipMap: Map<string, { count: number; timestamps: number[] }>;
  private pathMap: Map<string, { count: number; timestamps: number[] }>;
  private userMap: Map<string, { count: number; timestamps: number[] }>;
  private consecutiveFailures: Map<string, number>;

  constructor() {
    this.ipMap = new Map();
    this.pathMap = new Map();
    this.userMap = new Map();
    this.consecutiveFailures = new Map();
  }

  // Track an IP address hit
  trackIp(ip: string): boolean {
    return this.trackEntity(this.ipMap, ip, ALERT_THRESHOLDS.IP_THRESHOLD);
  }

  // Track a path hit
  trackPath(path: string): boolean {
    return this.trackEntity(this.pathMap, path, ALERT_THRESHOLDS.PATH_THRESHOLD);
  }

  // Track a user hit
  trackUser(userId: string): boolean {
    return this.trackEntity(this.userMap, userId, ALERT_THRESHOLDS.USER_THRESHOLD);
  }

  // Track consecutive failures for an entity (user, IP, or combined)
  trackConsecutiveFailures(key: string): boolean {
    const current = this.consecutiveFailures.get(key) || 0;
    const newCount = current + 1;
    this.consecutiveFailures.set(key, newCount);

    return newCount >= ALERT_THRESHOLDS.CONSECUTIVE_FAILURES;
  }

  // Reset consecutive failures for an entity
  resetConsecutiveFailures(key: string): void {
    this.consecutiveFailures.set(key, 0);
  }

  // Generic tracking logic for entities
  private trackEntity(
    map: Map<string, { count: number; timestamps: number[] }>,
    entity: string,
    threshold: number
  ): boolean {
    const now = Date.now();

    if (!map.has(entity)) {
      map.set(entity, { count: 1, timestamps: [now] });
      return false;
    }

    const record = map.get(entity)!;

    // Filter out timestamps that are outside our time window
    record.timestamps = record.timestamps.filter(ts => now - ts < ALERT_THRESHOLDS.TIME_WINDOW_MS);

    // Add current timestamp
    record.timestamps.push(now);

    // Update count
    record.count = record.timestamps.length;

    // Check if threshold is exceeded
    return record.count >= threshold;
  }

  // Clean up old records periodically
  cleanup(): void {
    const now = Date.now();
    const timeWindow = ALERT_THRESHOLDS.TIME_WINDOW_MS;

    // Helper function to clean a map
    const cleanMap = (map: Map<string, { count: number; timestamps: number[] }>) => {
      for (const [key, record] of map.entries()) {
        // Filter out timestamps outside time window
        const newTimestamps = record.timestamps.filter(ts => now - ts < timeWindow);

        if (newTimestamps.length === 0) {
          map.delete(key);
        } else {
          record.timestamps = newTimestamps;
          record.count = newTimestamps.length;
        }
      }
    };

    // Clean all maps
    cleanMap(this.ipMap);
    cleanMap(this.pathMap);
    cleanMap(this.userMap);
  }
}

// Singleton tracker instance
const rateLimitTracker = new RateLimitTracker();

// Clean up every 5 minutes
setInterval(
  () => {
    rateLimitTracker.cleanup();
  },
  5 * 60 * 1000
);

interface LoggerOptions {
  level?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private logger: winston.Logger;

  private constructor() {
    // Set log level from environment variable
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    if (envLogLevel && ['debug', 'info', 'warn', 'error'].includes(envLogLevel)) {
      this.logLevel = envLogLevel;
    }

    // Initialize Winston logger
    this.logger = winston.createLogger({
      level: this.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf((info: LogEntry) => {
          const moduleStr = info.module ? ` [${info.module}]` : '';
          const metadataStr = info.metadata ? ` ${JSON.stringify(info.metadata)}` : '';
          return `[${info.timestamp}] [${info.level.toUpperCase()}]${moduleStr}: ${info.message}${metadataStr}`;
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.colorize({ all: this.logLevel === 'debug' }),
        }),
        // Add file transport in production
        ...(this.logLevel === 'info'
          ? [
              new winston.transports.File({ filename: 'error.log', level: 'error' }),
              new winston.transports.File({ filename: 'combined.log' }),
            ]
          : []),
      ],
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    const context = entry.context ? ` [${entry.context}]` : '';
    const data = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';
    const error = entry.error ? `\n${entry.error.stack}` : '';
    return `${base}${context}${data}${error}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatMessage(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    // Implementation would depend on your logging service (e.g., Sentry, LogRocket, etc.)
    try {
      if (process.env.SENTRY_DSN && entry.level === 'error') {
        // Example: Send to Sentry
        const Sentry = await import('@sentry/node');
        Sentry.captureException(entry.error || entry.message, {
          level: entry.level,
          extra: {
            context: entry.context,
            data: entry.data
          }
        });
      }
    } catch (error) {
      console.error('Failed to send log to logging service:', error);
    }
  }

  public debug(message: string, context?: string, data?: any): void {
    this.log(this.createLogEntry('debug', message, context, data));
  }

  public info(message: string, context?: string, data?: any): void {
    this.log(this.createLogEntry('info', message, context, data));
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log(this.createLogEntry('warn', message, context, data));
  }

  public error(message: string, context?: string, data?: any, error?: Error): void {
    this.log(this.createLogEntry('error', message, context, data, error));
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  // Log a rate limit event and check for suspicious patterns
  rateLimit(event: RateLimitEvent): void {
    // Don't track events that didn't exceed the limit
    if (!event.exceeded) {
      // Reset consecutive failures if request succeeds
      if (event.userId) {
        rateLimitTracker.resetConsecutiveFailures(event.userId);
      }
      rateLimitTracker.resetConsecutiveFailures(event.ip);

      // Log normal rate limit check
      this.debug(`Rate limit check: ${event.path}`, 'rate-limiter', {
        ip: this.hashSensitiveData(event.ip),
        userId: event.userId ? this.hashSensitiveData(event.userId) : undefined,
        path: event.path,
        rateLimiter: event.rateLimiter,
        remaining: event.remaining,
      });

      return;
    }

    // Log the exceeded rate limit
    this.warn(`Rate limit exceeded: ${event.path}`, 'rate-limiter', {
      ip: this.hashSensitiveData(event.ip),
      userId: event.userId ? this.hashSensitiveData(event.userId) : undefined,
      path: event.path,
      rateLimiter: event.rateLimiter,
      resetTime: event.resetTime ? new Date(event.resetTime).toISOString() : undefined,
    });

    // Track suspicious patterns
    let isAttack = false;

    // Check IP-based suspicious patterns
    if (rateLimitTracker.trackIp(event.ip)) {
      this.alertSuspiciousActivity({
        reason: 'High rate of limit exceeded from single IP',
        ip: event.ip,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
      isAttack = true;
    }

    // Check path-based suspicious patterns
    if (rateLimitTracker.trackPath(event.path)) {
      this.alertSuspiciousActivity({
        reason: 'High rate of limit exceeded for single path',
        ip: event.ip,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
      isAttack = true;
    }

    // Check user-based suspicious patterns if user ID is available
    if (event.userId && rateLimitTracker.trackUser(event.userId)) {
      this.alertSuspiciousActivity({
        reason: 'High rate of limit exceeded for single user',
        ip: event.ip,
        userId: event.userId,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
      isAttack = true;
    }

    // Check consecutive failures
    const ipKey = event.ip;
    const userKey = event.userId || '';
    const combinedKey = `${ipKey}:${userKey}`;

    if (rateLimitTracker.trackConsecutiveFailures(combinedKey)) {
      this.alertSuspiciousActivity({
        reason: 'High rate of limit exceeded for combined IP and user',
        ip: event.ip,
        userId: event.userId,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
      isAttack = true;
    }

    if (isAttack) {
      this.warn('Suspicious activity detected', 'security', {
        ip: this.hashSensitiveData(event.ip),
        userId: event.userId ? this.hashSensitiveData(event.userId) : undefined,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
    }
  }

  // Hash sensitive data
  private hashSensitiveData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  // Alert suspicious activity
  private alertSuspiciousActivity(event: {
    reason: string;
    ip: string;
    userId?: string;
    path: string;
    rateLimiter: string;
  }): void {
    this.warn('Suspicious activity detected', 'security', {
      reason: event.reason,
      ip: this.hashSensitiveData(event.ip),
      userId: event.userId ? this.hashSensitiveData(event.userId) : undefined,
      path: event.path,
      rateLimiter: event.rateLimiter,
    });
  }
}

// Export a singleton instance
export const logger = Logger.getInstance();
