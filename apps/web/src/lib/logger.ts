/**
 * Logger Utility
 *
 * This module provides a configurable logger for the application, with special
 * support for rate limiting events and security-related logging.
 */

import { createHash } from 'crypto';
import type { Logger as WinstonLogger, LogEntry as WinstonLogEntry } from 'winston';
import winston from 'winston';

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
  private readonly logs: { timestamp: number; service: string }[] = [];
  private readonly windowMs = 60 * 1000; // 1 minute window
  private readonly threshold = 100;
  private warned = false;

  track(service: string): void {
    const now = Date.now();
    
    // Remove old logs by mutating the array
    // First determine indices to keep
    const validIndices = [];
    for (let i = 0; i < this.logs.length; i++) {
      if (now - this.logs[i].timestamp < this.windowMs) {
        validIndices.push(i);
      }
    }
    
    // Keep only valid logs
    const validLogs = validIndices.map(i => this.logs[i]);
    
    // Clear the array without reassigning
    this.logs.length = 0;
    
    // Add back valid logs
    validLogs.forEach(log => this.logs.push(log));
    
    // Add the new log
    this.logs.push({ timestamp: now, service });
    
    // Check if we've exceeded the threshold
    if (!this.warned && this.logs.length > this.threshold) {
      console.warn(`Rate limit warning: ${this.logs.length} logs in the last minute`);
      this.warned = true;
    }
  }
}

const rateLimiter = new RateLimitTracker();

// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'vibewell-app' },
  transports: [
    new winston.transports.Console(),
    // Add file transport in production
    ...(process.env.NODE_ENV === 'production' 
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ] 
      : [])
  ],
});

// Track rate of logging
const trackLogRate = (service: string) => {
  rateLimiter.track(service);
};

export { logger, trackLogRate };
