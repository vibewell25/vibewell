import { createLogger, format, transports } from 'winston';
import redisClient from '@/lib/redis-client';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  timestamp: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  ip?: string;
  userId?: string;
  metadata: Record<string, any>;
}

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

class SecurityMonitor {
  private readonly logger;
  private readonly eventPrefix = 'security:event:';
  private readonly alertThresholds = {
    failedLogins: 10,
    rateLimitExceeded: 50,
    invalidApiKeys: 5,
  };

  constructor() {
    this.logger = createLogger({
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.File({ filename: 'logs/security.log' }),
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      ],
    });
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log to Winston
    this.logger.log({
      level: this.getSeverityLevel(event.severity),
      message: event.message,
      ...event,
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
    const windowStart = now - timeWindow * 1000;

    // Get recent events of the same type
    const keys = await redisClient.keys(`${this.eventPrefix}*`);
    const events = await Promise.all(
      keys.map(async (key) => {
        const eventData = await redisClient.get(key);
        return eventData ? (JSON.parse(eventData) as SecurityEvent) : null;
      }),
    );

    const recentEvents = events.filter(
      (e) => e && e.type === event.type && e.timestamp > windowStart,
    );

    // Check thresholds and trigger alerts
    switch (event.type) {
      case 'failed_login':
        if (recentEvents.length >= this.alertThresholds.failedLogins) {
          await this.triggerAlert('High number of failed login attempts detected', {
            count: recentEvents.length,
            timeWindow,
            severity: 'high',
          });
        }
        break;

      case 'rate_limit_exceeded':
        if (recentEvents.length >= this.alertThresholds.rateLimitExceeded) {
          await this.triggerAlert('Unusual rate limit violations detected', {
            count: recentEvents.length,
            timeWindow,
            severity: 'medium',
          });
        }
        break;

      case 'invalid_api_key':
        if (recentEvents.length >= this.alertThresholds.invalidApiKeys) {
          await this.triggerAlert('Multiple invalid API key attempts detected', {
            count: recentEvents.length,
            timeWindow,
            severity: 'critical',
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
      ...data,
    });

    // Store alert in Redis for dashboard
    const alertKey = `security:alert:${Date.now()}`;
    await redisClient.set(
      alertKey,
      JSON.stringify({
        message,
        data,
        timestamp: Date.now(),
      }),
      'EX',
      60 * 60 * 24 * 7,
    ); // 7 day retention for alerts

    // Create security alert object
    const securityAlert: SecurityAlert = {
      id: alertKey.split(':').pop() || String(Date.now()),
      type: data.type || 'SECURITY_VIOLATION',
      message,
      timestamp: Date.now(),
      ip: data.ip,
      userId: data.userId,
      metadata: { ...data },
    };

    // Determine severity from data
    let severity: AlertSeverity = 'medium';
    if (data.severity) {
      severity = this.mapSeverityToAlertSeverity(data.severity);
    }

    // Send notifications to admins
    await this.notifyAdmins(securityAlert, severity);

    // Send to external notification services if severe enough
    if (severity === 'high' || severity === 'critical') {
      await this.sendToExternalServices(securityAlert, severity);
    }
  }

  private mapSeverityToAlertSeverity(severity: string): AlertSeverity {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  private async sendToExternalServices(
    alert: SecurityAlert,
    severity: AlertSeverity,
  ): Promise<void> {
    try {
      // Send to appropriate external services based on severity
      if (severity === 'critical') {
        // For critical alerts, use multiple channels including SMS
        await Promise.all([
          this.sendEmailAlert(alert, severity),
          this.sendSlackAlert(alert, severity),
          this.sendSmsAlert(alert),
        ]);
      } else if (severity === 'high') {
        // For high severity, use email and Slack
        await Promise.all([
          this.sendEmailAlert(alert, severity),
          this.sendSlackAlert(alert, severity),
        ]);
      } else {
        // For medium and low, just use Slack
        await this.sendSlackAlert(alert, severity);
      }
    } catch (error) {
      this.logger.error('Failed to send security alert to external services', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async sendEmailAlert(alert: SecurityAlert, severity: AlertSeverity): Promise<void> {
    try {
      const securityEmail = process.env['SECURITY_ALERT_EMAIL'];
      if (!securityEmail) {
        this.logger.warn('No security alert email configured');
        return;
      }

      // Import email service dynamically
      const { EmailService } = await import('@/lib/email');

      // Create email content
      const subject = `🚨 VibeWell Security Alert (${severity.toUpperCase()}): ${alert.type}`;
      const html = `
        <h1>Security Alert: ${alert.type}</h1>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
        <p><strong>Time:</strong> ${new Date(alert.timestamp).toISOString()}</p>
        ${alert.userId ? `<p><strong>User ID:</strong> ${alert.userId}</p>` : ''}
        ${alert.ip ? `<p><strong>IP Address:</strong> ${alert.ip}</p>` : ''}
        <h2>Metadata</h2>
        <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
        <p>Please review this alert in the <a href="${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/admin/security">Security Dashboard</a>.</p>
      `;

      // Send email
      await EmailService.send({
        to: securityEmail,
        subject,
        html,
        text: this.formatPlainTextAlert(alert, severity),
      });

      this.logger.info('Security alert email sent', {
        alertId: alert.id,
        to: securityEmail,
      });
    } catch (error) {
      this.logger.error('Failed to send security alert email', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private formatPlainTextAlert(alert: SecurityAlert, severity: AlertSeverity): string {
    return `
Security Alert: ${alert.type}
Message: ${alert.message}
Severity: ${severity.toUpperCase()}
Time: ${new Date(alert.timestamp).toISOString()}
${alert.userId ? `User ID: ${alert.userId}` : ''}
${alert.ip ? `IP Address: ${alert.ip}` : ''}

Metadata:
${JSON.stringify(alert.metadata, null, 2)}

Please review this alert in the Security Dashboard.
URL: ${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/admin/security
    `;
  }

  private async sendSlackAlert(alert: SecurityAlert, severity: AlertSeverity): Promise<void> {
    try {
      const slackWebhookUrl = process.env['SLACK_SECURITY_WEBHOOK_URL'];
      if (!slackWebhookUrl) {
        this.logger.warn('No Slack webhook configured for security alerts');
        return;
      }

      // Create Slack message with blocks
      const payload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 Security Alert: ${alert.type}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message:* ${alert.message}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Severity:* ${this.getSeverityEmoji(severity)} ${severity.toUpperCase()}`,
              },
              {
                type: 'mrkdwn',
                text: `*Time:* ${new Date(alert.timestamp).toLocaleString()}`,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*User ID:* ${alert.userId || 'N/A'}`,
              },
              {
                type: 'mrkdwn',
                text: `*IP Address:* ${alert.ip || 'N/A'}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Metadata:*\n\`\`\`${JSON.stringify(alert.metadata, null, 2)}\`\`\``,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in Dashboard',
                  emoji: true,
                },
                url: `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/admin/security?alert=${alert.id}`,
              },
            ],
          },
        ],
      };

      // Send to Slack
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      this.logger.info('Security alert sent to Slack', {
        alertId: alert.id,
      });
    } catch (error) {
      this.logger.error('Failed to send security alert to Slack', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      default:
        return '🟢';
    }
  }

  private async sendSmsAlert(alert: SecurityAlert): Promise<void> {
    try {
      const twilioAccountSid = process.env['TWILIO_ACCOUNT_SID'];
      const twilioAuthToken = process.env['TWILIO_AUTH_TOKEN'];
      const twilioPhoneNumber = process.env['TWILIO_PHONE_NUMBER'];
      const securityPhoneNumber = process.env['SECURITY_ALERT_PHONE'];

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber || !securityPhoneNumber) {
        this.logger.warn('Missing Twilio configuration for SMS alerts');
        return;
      }

      // Import Twilio dynamically to avoid loading it unless needed
      const twilio = await import('twilio');
      const client = twilio.default(twilioAccountSid, twilioAuthToken);

      // Create SMS message
      const message = `CRITICAL SECURITY ALERT: ${alert.type}. ${alert.message}. Time: ${new Date(alert.timestamp).toLocaleString()}. Check dashboard immediately.`;

      // Send SMS via Twilio
      await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: securityPhoneNumber,
      });

      this.logger.info('Security alert SMS sent', {
        alertId: alert.id,
        to: securityPhoneNumber,
      });
    } catch (error) {
      this.logger.error('Failed to send security alert SMS', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private getSeverityLevel(severity: SecurityEvent['severity']): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warn';
      case 'medium':
        return 'info';
      case 'low':
        return 'debug';
      default:
        return 'info';
    }
  }

  // Helper method to get recent security events
  async getRecentEvents(minutes: number = 60): Promise<SecurityEvent[]> {
    const windowStart = Date.now() - minutes * 60 * 1000;
    const keys = await redisClient.keys(`${this.eventPrefix}*`);
    const events = await Promise.all(
      keys.map(async (key) => {
        const eventData = await redisClient.get(key);
        return eventData ? (JSON.parse(eventData) as SecurityEvent) : null;
      }),
    );

    return events
      .filter((e): e is SecurityEvent => e !== null && e.timestamp > windowStart)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async notifyAdmins(securityAlert: SecurityAlert, severity: AlertSeverity): Promise<void> {
    try {
      // Import PrismaClient dynamically
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Get admin users who should receive security alerts
      const adminUsers = await prisma.user.findMany({
        where: {
          roles: {
            hasSome: ['ADMIN', 'SECURITY_ADMIN'],
          },
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!adminUsers.length) {
        this.logger.warn('No admin users found to notify for security alert');
        return;
      }

      // Import notification service
      const { NotificationService } = await import('@/services/notification-service');
      const notificationService = new NotificationService();

      // Format the alert message
      const title = `Security Alert: ${securityAlert.type}`;
      let message = `Alert: ${securityAlert.message}\n`;
      message += `Severity: ${severity}\n`;
      message += `Time: ${new Date(securityAlert.timestamp).toLocaleString()}\n`;
      if (securityAlert.ip) message += `IP: ${securityAlert.ip}\n`;
      if (securityAlert.userId) message += `User: ${securityAlert.userId}\n`;

      // Send notifications to all admin users
      const adminIds = adminUsers.map((user) => user.id);
      await notificationService.sendBulkNotifications(adminIds, {
        type: 'SYSTEM',
        title,
        message,
        data: {
          alertId: securityAlert.id,
          severity,
          alertType: securityAlert.type,
          timestamp: securityAlert.timestamp,
        },
      });

      // Clean up the prisma connection
      await prisma.$disconnect();

      this.logger.info('Security alert notifications sent to admins', {
        alertId: securityAlert.id,
        adminsNotified: adminIds.length,
      });
    } catch (error) {
      this.logger.error('Failed to notify admins of security alert', {
        alertId: securityAlert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export {};
