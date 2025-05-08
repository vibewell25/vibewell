import { AlertingSystem, AlertConfig, AlertSeverity } from '../../types/monitoring';
import nodemailer from 'nodemailer';
import axios from 'axios';

interface SlackPayload {
  text: string;
  blocks: any[];
}

export class AlertingSystemImpl implements AlertingSystem {
  private readonly emailTransporter: nodemailer.Transporter;
  private readonly monitoringEndpoint: string;
  private readonly slackWebhookUrl: string;
  
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });
    
    // Set monitoring service endpoint
    this.monitoringEndpoint = process.env.MONITORING_ENDPOINT || 'https://monitoring.vibewell.com/api/alerts';
    
    // Set Slack webhook URL
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * Send an alert through multiple channels based on severity and configuration
   */
  async sendAlert(name: string, config: AlertConfig): Promise<void> {
    try {
      const promises: Promise<any>[] = [];
      
      // Log all alerts
      console.log(`Alert: ${name}`, config);
      
      // For critical and high severity, send to all channels
      if (config.severity === AlertSeverity.CRITICAL || config.severity === AlertSeverity.HIGH) {
        promises.push(this.sendToEmail(name, config));
        promises.push(this.sendToSlack(name, config));
        promises.push(this.sendToMonitoringService(name, config));
      } 
      // For medium severity, send to Slack and monitoring service
      else if (config.severity === AlertSeverity.MEDIUM) {
        promises.push(this.sendToSlack(name, config));
        promises.push(this.sendToMonitoringService(name, config));
      } 
      // For low severity, just send to monitoring service
      else {
        promises.push(this.sendToMonitoringService(name, config));
      }
      
      // Wait for all promises to resolve
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send alert:', error);
      // Fall back to console logging if there was an error
      console.error(`Alert (fallback): ${name}`, config);
    }
  }
  
  /**
   * Send alert via email
   */
  private async sendToEmail(name: string, config: AlertConfig): Promise<void> {
    if (!process.env.ALERT_EMAIL_RECIPIENTS) {
      console.warn('No email recipients configured for alerts');
      return;
    }
    
    const recipients = process.env.ALERT_EMAIL_RECIPIENTS.split(',');
    
    const severityLabel = this.getSeverityLabel(config.severity);
    
    await this.emailTransporter.sendMail({
      from: `"VibeWell Monitoring" <${process.env.ALERT_EMAIL_FROM || 'alerts@vibewell.com'}>`,
      to: recipients.join(', '),
      subject: `[${severityLabel}] VibeWell Alert: ${name}`,
      html: `
        <h2>VibeWell Alert: ${name}</h2>
        <p><strong>Severity:</strong> ${severityLabel}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Message:</strong> ${config.message}</p>
        ${config.details ? `<h3>Details:</h3><pre>${JSON.stringify(config.details, null, 2)}</pre>` : ''}
        ${config.actionItems ? `<h3>Action Items:</h3><ul>${config.actionItems.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
      `,
    });
  }
  
  /**
   * Send alert to Slack
   */
  private async sendToSlack(name: string, config: AlertConfig): Promise<void> {
    if (!this.slackWebhookUrl) {
      console.warn('No Slack webhook URL configured for alerts');
      return;
    }
    
    const severityLabel = this.getSeverityLabel(config.severity);
    const severityColor = this.getSeverityColor(config.severity);
    
    const payload: SlackPayload = {
      text: `VibeWell Alert: ${name} (${severityLabel})`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Alert: ${name}`,
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Severity:*\n${severityLabel}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date().toISOString()}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:*\n${config.message}`
          }
        }
      ]
    };
    
    // Add details if available
    if (config.details) {
      payload.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n\`\`\`${JSON.stringify(config.details, null, 2)}\`\`\``
        }
      });
    }
    
    // Add action items if available
    if (config.actionItems && config.actionItems.length > 0) {
      const actionItemsText = config.actionItems
        .map(item => `• ${item}`)
        .join('\n');
      
      payload.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Items:*\n${actionItemsText}`
        }
      });
    }
    
    // Add divider and context
    payload.blocks.push(
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Environment:* ${process.env.NODE_ENV || 'development'}`
          }
        ]
      }
    );
    
    await axios.post(this.slackWebhookUrl, payload);
  }
  
  /**
   * Send alert to monitoring service
   */
  private async sendToMonitoringService(name: string, config: AlertConfig): Promise<void> {
    if (!this.monitoringEndpoint) {
      console.warn('No monitoring endpoint configured for alerts');
      return;
    }
    
    const payload = {
      name,
      severity: config.severity,
      message: config.message,
      timestamp: new Date().toISOString(),
      details: config.details || {},
      actionItems: config.actionItems || [],
      source: 'vibewell-web',
      environment: process.env.NODE_ENV || 'development',
    };
    
    await axios.post(this.monitoringEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONITORING_API_KEY || ''}`
      }
    });
  }
  
  /**
   * Get human-readable severity label
   */
  private getSeverityLabel(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'CRITICAL';
      case AlertSeverity.HIGH:
        return 'HIGH';
      case AlertSeverity.MEDIUM:
        return 'MEDIUM';
      case AlertSeverity.LOW:
        return 'LOW';
      default:
        return 'INFO';
    }
  }
  
  /**
   * Get color code for severity (used in Slack)
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '#FF0000'; // Red
      case AlertSeverity.HIGH:
        return '#FF9900'; // Orange
      case AlertSeverity.MEDIUM:
        return '#FFCC00'; // Yellow
      case AlertSeverity.LOW:
        return '#36A64F'; // Green
      default:
        return '#CCCCCC'; // Gray
    }
  }
}
