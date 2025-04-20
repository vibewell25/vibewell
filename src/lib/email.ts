import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // Configure your email service here
  });

  static async send(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        ...options,
        from: process.env.EMAIL_FROM
      });
      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }
} 