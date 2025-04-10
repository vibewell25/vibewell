/**
 * Logger Utility
 * 
 * This module provides a configurable logger for the application, with special
 * support for rate limiting events and security-related logging.
 */

import { createHash } from 'crypto';

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
  private trackEntity(map: Map<string, { count: number; timestamps: number[] }>, entity: string, threshold: number): boolean {
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
setInterval(() => {
  rateLimitTracker.cleanup();
}, 5 * 60 * 1000);

class Logger {
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }
  
  // Log a message at the specified level
  log(level: LogLevel, message: string, module?: string, metadata?: Record<string, any>): void {
    const logEvent: LogEvent = {
      message,
      module,
      metadata: this.sanitizeMetadata(metadata),
      timestamp: new Date(),
    };
    
    // In production, you would send this to a logging service
    if (this.isProduction) {
      // Send to logging service
      // Example: logstashClient.send(logEvent);
    } else {
      // In development, just log to console with appropriate level
      const logFn = 
        level === 'debug' ? console.debug : 
        level === 'info' ? console.info : 
        level === 'warn' ? console.warn : 
        console.error;
      
      logFn(`[${logEvent.timestamp.toISOString()}] [${level.toUpperCase()}]${module ? ` [${module}]` : ''}: ${message}`, metadata ? metadata : '');
    }
  }
  
  // Debug level log
  debug(message: string, module?: string, metadata?: Record<string, any>): void {
    this.log('debug', message, module, metadata);
  }
  
  // Info level log
  info(message: string, module?: string, metadata?: Record<string, any>): void {
    this.log('info', message, module, metadata);
  }
  
  // Warning level log
  warn(message: string, module?: string, metadata?: Record<string, any>): void {
    this.log('warn', message, module, metadata);
  }
  
  // Error level log
  error(message: string, module?: string, metadata?: Record<string, any>): void {
    this.log('error', message, module, metadata);
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
    
    if (rateLimitTracker.trackConsecutiveFailures(ipKey) ||
        (event.userId && rateLimitTracker.trackConsecutiveFailures(userKey)) ||
        rateLimitTracker.trackConsecutiveFailures(combinedKey)) {
      this.alertSuspiciousActivity({
        reason: 'Consecutive rate limit failures',
        ip: event.ip,
        userId: event.userId,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
      isAttack = true;
    }
    
    // If this appears to be an attack, log it
    if (isAttack) {
      this.error(`Possible API abuse detected`, 'security', {
        ip: this.hashSensitiveData(event.ip),
        userId: event.userId ? this.hashSensitiveData(event.userId) : undefined,
        path: event.path,
        rateLimiter: event.rateLimiter,
      });
    }
  }
  
  // Alert about suspicious activity
  private alertSuspiciousActivity(details: Record<string, any>): void {
    this.error(`SECURITY ALERT: Suspicious rate limit activity detected`, 'security', details);
    
    // In production, you would send alerts to security team
    if (this.isProduction) {
      this.sendSecurityAlert('rate_limit_abuse', details);
    }
  }
  
  // Send security alert to appropriate channels
  private sendSecurityAlert(alertType: string, details: Record<string, any>): void {
    // In a real implementation, this would send alerts to:
    // 1. Security monitoring systems
    // 2. Email to security team
    // 3. Slack/Teams alerts
    // 4. SMS for critical alerts
    
    // For now, just log that we would send an alert
    console.error(`[SECURITY ALERT] ${alertType}`, details);
  }
  
  // Hash sensitive data before logging
  private hashSensitiveData(data: string): string {
    // In production, you might want to use a proper anonymization technique
    // This simple hash is just for demonstration
    return createHash('sha256').update(data).digest('hex').substring(0, 8);
  }
  
  // Sanitize metadata to remove sensitive information
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;
    
    const sanitized = { ...metadata };
    
    // List of fields to either remove or hash
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'credit_card',
      'ssn', 'social', 'dob', 'birth', 'phone', 'address',
    ];
    
    // Remove or hash sensitive fields
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Check if this is a sensitive field
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        if (typeof sanitized[key] === 'string') {
          // Hash string values
          sanitized[key] = this.hashSensitiveData(sanitized[key]);
        } else {
          // Remove non-string sensitive data
          delete sanitized[key];
        }
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeMetadata(sanitized[key]);
      }
    });
    
    return sanitized;
  }
}

// Export singleton instance
export const logger = new Logger(); 