import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env['EMAIL_SERVER_HOST'],
    port: parseInt(process.env['EMAIL_SERVER_PORT'] || '587', 10),
    secure: process.env['EMAIL_SECURE'] === 'true',
    auth: {
      user: process.env['EMAIL_SERVER_USER'],
      pass: process.env['EMAIL_SERVER_PASSWORD'],
    },
    tls: {
      rejectUnauthorized: process.env['NODE_ENV'] === 'production',
    },
  });

  static async send(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        ...options,
        from: process.env['EMAIL_FROM'] || 'noreply@vibewell.com',
      });
      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }


  // Create a development-only transporter for testing
  static createTestTransporter() {
    if (process.env['NODE_ENV'] !== 'production') {
      return nodemailer.createTransport({
        host: 'localhost',
        port: 1025, // mailhog default port
        secure: false,
        ignoreTLS: true,
      });
    }
    return this.transporter;
  }
}
