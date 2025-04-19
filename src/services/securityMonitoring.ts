import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

export interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

export class SecurityMonitoringService {
  private redis: Redis;
  private readonly eventTTL = 30 * 24 * 60 * 60; // 30 days

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
  }

  /**
   * Log a security event
   */
  async logEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    try {
      // Store event in Redis
      const eventKey = `security:event:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      await this.redis.setex(
        eventKey,
        this.eventTTL,
        JSON.stringify(fullEvent)
      );

      // Log to application logger
      logger.info('Security event', 'security', {
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        details: event.details
      });

      // Check if event requires immediate alert
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.triggerAlert(fullEvent);
      }

      // Update event counters
      await this.updateEventCounters(event);
    } catch (error) {
      logger.error('Failed to log security event', 'security', { error, event });
    }
  }

  /**
   * Get recent security events
   */
  async getRecentEvents(
    limit: number = 100,
    severity?: SecurityEvent['severity']
  ): Promise<SecurityEvent[]> {
    try {
      const keys = await this.redis.keys('security:event:*');
      const events: SecurityEvent[] = [];

      for (const key of keys.slice(-limit)) {
        const eventData = await this.redis.get(key);
        if (eventData) {
          const event = JSON.parse(eventData) as SecurityEvent;
          if (!severity || event.severity === severity) {
            events.push(event);
          }
        }
      }

      return events.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      logger.error('Failed to get recent events', 'security', { error });
      return [];
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(timeWindow: number = 24 * 60 * 60): Promise<{
    totalEvents: number;
    bySeverity: Record<SecurityEvent['severity'], number>;
    byType: Record<string, number>;
  }> {
    const now = Date.now();
    const windowStart = now - (timeWindow * 1000);

    try {
      const counters = await this.redis.hgetall(`security:counters:${this.getTimeKey()}`);
      
      return {
        totalEvents: parseInt(counters.total || '0'),
        bySeverity: {
          low: parseInt(counters.severity_low || '0'),
          medium: parseInt(counters.severity_medium || '0'),
          high: parseInt(counters.severity_high || '0'),
          critical: parseInt(counters.severity_critical || '0')
        },
        byType: Object.entries(counters)
          .filter(([key]) => key.startsWith('type_'))
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key.replace('type_', '')]: parseInt(value)
          }), {})
      };
    } catch (error) {
      logger.error('Failed to get event stats', 'security', { error });
      return {
        totalEvents: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        byType: {}
      };
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const recentEvents = await this.getRecentEvents(50);
      const userEvents = recentEvents.filter(e => e.userId === userId);

      // Check for multiple failed login attempts
      const failedLogins = userEvents.filter(
        e => e.type === 'login_failed'
      ).length;
      if (failedLogins >= 5) return true;

      // Check for multiple MFA failures
      const mfaFailures = userEvents.filter(
        e => e.type === 'mfa_verification_failed'
      ).length;
      if (mfaFailures >= 3) return true;

      // Check for password reset attempts
      const passwordResets = userEvents.filter(
        e => e.type === 'password_reset_requested'
      ).length;
      if (passwordResets >= 3) return true;

      return false;
    } catch (error) {
      logger.error('Failed to detect suspicious activity', 'security', { error, userId });
      return false;
    }
  }

  private async triggerAlert(event: SecurityEvent): Promise<void> {
    // Log critical/high severity events
    logger.error('Security alert', 'security', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      details: event.details
    });

    // TODO: Implement external alerting (e.g., email, Slack, PagerDuty)
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Security Alert (${event.severity}): ${event.type}`,
            details: event
          })
        });
      } catch (error) {
        logger.error('Failed to send alert webhook', 'security', { error, event });
      }
    }
  }

  private async updateEventCounters(event: SecurityEvent): Promise<void> {
    const timeKey = this.getTimeKey();
    const counterKey = `security:counters:${timeKey}`;

    try {
      await this.redis.multi()
        .hincrby(counterKey, 'total', 1)
        .hincrby(counterKey, `severity_${event.severity}`, 1)
        .hincrby(counterKey, `type_${event.type}`, 1)
        .expire(counterKey, this.eventTTL)
        .exec();
    } catch (error) {
      logger.error('Failed to update event counters', 'security', { error, event });
    }
  }

  private getTimeKey(): string {
    const date = new Date();
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
  }
} 