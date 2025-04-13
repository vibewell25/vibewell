import { createLogger, format, transports } from 'winston';
import redisClient from '@/lib/redis-client';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  timestamp: number;
}

class SecurityMonitor {
  private readonly logger;
  private readonly eventPrefix = 'security:event:';
  private readonly alertThresholds = {
    failedLogins: 10,
    rateLimitExceeded: 50,
    invalidApiKeys: 5
  };

  constructor() {
    this.logger = createLogger({
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.File({ filename: 'logs/security.log' }),
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      ]
    });
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log to Winston
    this.logger.log({
      level: this.getSeverityLevel(event.severity),
      message: event.message,
      ...event
    });

    // Store in Redis for real-time monitoring
    const eventKey = `${this.eventPrefix}${Date.now()}`;
    await redisClient.set(eventKey, JSON.stringify(event), 'EX', 60 * 60 * 24); // 24 hour retention

    // Check if we need to trigger alerts
    await this.checkAlertThresholds(event);
  }

  private async checkAlertThresholds(event: SecurityEvent): Promise<void> {
    const timeWindow = 60 * 15; // 15 minutes
    const now = Date.now();
    const windowStart = now - (timeWindow * 1000);

    // Get recent events of the same type
    const keys = await redisClient.keys(`${this.eventPrefix}*`);
    const events = await Promise.all(
      keys.map(async (key) => {
        const eventData = await redisClient.get(key);
        return eventData ? JSON.parse(eventData) as SecurityEvent : null;
      })
    );

    const recentEvents = events.filter(e => 
      e && e.type === event.type && e.timestamp > windowStart
    );

    // Check thresholds and trigger alerts
    switch (event.type) {
      case 'failed_login':
        if (recentEvents.length >= this.alertThresholds.failedLogins) {
          await this.triggerAlert('High number of failed login attempts detected', {
            count: recentEvents.length,
            timeWindow,
            severity: 'high'
          });
        }
        break;

      case 'rate_limit_exceeded':
        if (recentEvents.length >= this.alertThresholds.rateLimitExceeded) {
          await this.triggerAlert('Unusual rate limit violations detected', {
            count: recentEvents.length,
            timeWindow,
            severity: 'medium'
          });
        }
        break;

      case 'invalid_api_key':
        if (recentEvents.length >= this.alertThresholds.invalidApiKeys) {
          await this.triggerAlert('Multiple invalid API key attempts detected', {
            count: recentEvents.length,
            timeWindow,
            severity: 'critical'
          });
        }
        break;
    }
  }

  private async triggerAlert(message: string, data: Record<string, any>): Promise<void> {
    // Log alert
    this.logger.error({
      level: 'error',
      message: `SECURITY ALERT: ${message}`,
      ...data
    });

    // Store alert in Redis for dashboard
    const alertKey = `security:alert:${Date.now()}`;
    await redisClient.set(alertKey, JSON.stringify({
      message,
      data,
      timestamp: Date.now()
    }), 'EX', 60 * 60 * 24 * 7); // 7 day retention for alerts

    // TODO: Implement notification service integration
    // this.notificationService.sendAlert(message, data);
  }

  private getSeverityLevel(severity: SecurityEvent['severity']): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warn';
      case 'medium': return 'info';
      case 'low': return 'debug';
      default: return 'info';
    }
  }

  // Helper method to get recent security events
  async getRecentEvents(minutes: number = 60): Promise<SecurityEvent[]> {
    const windowStart = Date.now() - (minutes * 60 * 1000);
    const keys = await redisClient.keys(`${this.eventPrefix}*`);
    const events = await Promise.all(
      keys.map(async (key) => {
        const eventData = await redisClient.get(key);
        return eventData ? JSON.parse(eventData) as SecurityEvent : null;
      })
    );

    return events
      .filter((e): e is SecurityEvent => e !== null && e.timestamp > windowStart)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const securityMonitor = new SecurityMonitor(); 