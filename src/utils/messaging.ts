import type { MessagingConfig } from '../types/third-party';
import { ThirdPartyManager } from '../services/third-party-manager';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface SMSMessage {
  to: string | string[];
  body: string;
  from?: string;
  mediaUrl?: string[];
}

export interface PushNotification {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  priority?: 'normal' | 'high';
  ttl?: number;
}

export class MessagingUtils {
  private static manager = ThirdPartyManager.getInstance();

  static async sendEmail(message: EmailMessage): Promise<any> {
    const messaging = this.manager.getService('messaging');
    if (!messaging) throw new Error('Messaging service not initialized');

    const config = this.manager.getServiceConfig('messaging') as MessagingConfig;

    try {
      switch (config.service) {
        case 'sendgrid': {
          const msg = {
            to: message.to,
            from: message.from || config.sender?.email,
            subject: message.subject,
            text: message.text,
            html: message.html,
            templateId: message.templateId,
            dynamicTemplateData: message.templateData,
            attachments: message.attachments?.map((attachment) => ({
              filename: attachment.filename,
              content: Buffer.isBuffer(attachment.content)
                ? attachment.content.toString('base64')
                : attachment.content,
              type: attachment.contentType,
            })),
          };

          return await messaging.send(msg);
        }

        case 'twilio': {
          if (!message.templateId) {
            throw new Error('Template ID is required for Twilio email service');
          }

          return await messaging.messages.create({
            to: Array.isArray(message.to) ? message.to[0] : message.to,
            from: message.from || config.sender?.email,
            templateId: message.templateId,
            dynamicTemplateData: message.templateData,
          });
        }

        default:
          throw new Error(`Unsupported email service: ${config.service}`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  static async sendSMS(message: SMSMessage): Promise<any> {
    const messaging = this.manager.getService('messaging');
    if (!messaging) throw new Error('Messaging service not initialized');

    const config = this.manager.getServiceConfig('messaging') as MessagingConfig;

    try {
      switch (config.service) {
        case 'twilio': {
          const recipients = Array.isArray(message.to) ? message.to : [message.to];
          const responses = await Promise.all(
            recipients.map((to) =>
              messaging.messages.create({
                to,
                from: message.from || config.sender?.phone,
                body: message.body,
                mediaUrl: message.mediaUrl,
              }),
            ),
          );
          return responses;
        }

        default:
          throw new Error(`Unsupported SMS service: ${config.service}`);
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  static async sendPushNotification(notification: PushNotification): Promise<any> {
    const messaging = this.manager.getService('messaging');
    if (!messaging) throw new Error('Messaging service not initialized');

    const config = this.manager.getServiceConfig('messaging') as MessagingConfig;

    try {
      switch (config.service) {
        case 'firebase-fcm': {
          const message = {
            notification: {
              title: notification.title,
              body: notification.body,
              imageUrl: notification.imageUrl,
            },
            data: notification.data,
            android: {
              priority: notification.priority === 'high' ? 'high' : 'normal',
              ttl: notification.ttl ? notification.ttl * 1000 : undefined,
            },
            tokens: notification.tokens,
          };

          return await messaging.sendMulticast(message);
        }

        default:
          throw new Error(`Unsupported push notification service: ${config.service}`);
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  static async validateEmailTemplate(
    templateId: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    const messaging = this.manager.getService('messaging');
    if (!messaging) throw new Error('Messaging service not initialized');

    const config = this.manager.getServiceConfig('messaging') as MessagingConfig;

    try {
      switch (config.service) {
        case 'sendgrid': {
          const template = await messaging.templates.get(templateId);
          const requiredVariables = template.versions[0].subject.match(/{{(.*?)}}/g) || [];

          return requiredVariables.every((variable) => {
            const key = variable.replace(/[{}]/g, '').trim();
            return data.hasOwnProperty(key);
          });
        }

        default:
          return true;
      }
    } catch (error) {
      console.error('Failed to validate email template:', error);
      return false;
    }
  }

  static async getDeliveryStatus(messageId: string): Promise<string> {
    const messaging = this.manager.getService('messaging');
    if (!messaging) throw new Error('Messaging service not initialized');

    const config = this.manager.getServiceConfig('messaging') as MessagingConfig;

    try {
      switch (config.service) {
        case 'twilio': {
          const message = await messaging.messages(messageId).fetch();
          return message.status;
        }

        case 'sendgrid': {
          const events = await messaging.eventWebhook.getEventWebhookSettings();
          return events.processed ? 'delivered' : 'pending';
        }

        case 'firebase-fcm': {
          const result = await messaging.messaging().getMessagingCondition(messageId);
          return result.success ? 'delivered' : 'failed';
        }

        default:
          throw new Error(`Unsupported delivery status check for service: ${config.service}`);
      }
    } catch (error) {
      console.error('Failed to get delivery status:', error);
      throw error;
    }
  }
}
