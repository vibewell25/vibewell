import { authenticator } from 'otplib';
import { createTransport } from 'nodemailer';
import { Twilio } from 'twilio';
import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';
import { EncryptionService } from './encryption';

export type MFAMethod = 'totp' | 'sms' | 'email';

interface MFASettings {
  userId: string;
  methods: MFAMethod[];
  totpSecret?: string;
  phoneNumber?: string;
  email?: string;
  backupCodes?: string[];
}

export class MFAService {
  private redis: Redis;
  private encryption: EncryptionService;
  private emailTransport;
  private twilioClient;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
    this.encryption = new EncryptionService();
    
    // Initialize email transport
    this.emailTransport = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Twilio client
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  /**
   * Enable MFA for a user
   */
  async enableMFA(userId: string, method: MFAMethod): Promise<{ secret?: string }> {
    try {
      const settings = await this.getMFASettings(userId);
      
      if (settings?.methods.includes(method)) {
        throw new Error(`MFA method ${method} is already enabled`);
      }

      const newSettings: MFASettings = {
        userId,
        methods: [...(settings?.methods || []), method],
        ...(settings || {})
      };

      switch (method) {
        case 'totp': {
          const secret = authenticator.generateSecret();
          newSettings.totpSecret = await this.encryption.hash(secret);
          await this.storeMFASettings(userId, newSettings);
          return { secret };
        }
        case 'sms':
        case 'email':
          await this.storeMFASettings(userId, newSettings);
          return {};
        default:
          throw new Error(`Unsupported MFA method: ${method}`);
      }
    } catch (error) {
      logger.error('Failed to enable MFA', 'mfa', { error, userId, method });
      throw new Error('Failed to enable MFA');
    }
  }

  /**
   * Verify an MFA code
   */
  async verifyCode(
    userId: string,
    method: MFAMethod,
    code: string
  ): Promise<boolean> {
    try {
      const settings = await this.getMFASettings(userId);
      if (!settings || !settings.methods.includes(method)) {
        throw new Error(`MFA method ${method} is not enabled`);
      }

      const codeKey = `mfa:code:${userId}:${method}`;
      
      switch (method) {
        case 'totp': {
          if (!settings.totpSecret) {
            throw new Error('TOTP is not properly configured');
          }
          return authenticator.verify({
            token: code,
            secret: settings.totpSecret
          });
        }
        case 'sms':
        case 'email': {
          const storedCode = await this.redis.get(codeKey);
          if (!storedCode) {
            throw new Error('Code has expired');
          }
          const isValid = await this.encryption.verify(code, storedCode);
          if (isValid) {
            await this.redis.del(codeKey);
          }
          return isValid;
        }
        default:
          throw new Error(`Unsupported MFA method: ${method}`);
      }
    } catch (error) {
      logger.error('Failed to verify MFA code', 'mfa', { error, userId, method });
      throw new Error('Failed to verify MFA code');
    }
  }

  /**
   * Send an MFA code via SMS or email
   */
  async sendCode(userId: string, method: MFAMethod): Promise<void> {
    try {
      const settings = await this.getMFASettings(userId);
      if (!settings || !settings.methods.includes(method)) {
        throw new Error(`MFA method ${method} is not enabled`);
      }

      const code = this.generateCode();
      const hashedCode = await this.encryption.hash(code);
      const codeKey = `mfa:code:${userId}:${method}`;
      
      // Store the code with 5-minute expiration
      await this.redis.set(codeKey, hashedCode, 'EX', 300);

      switch (method) {
        case 'sms': {
          if (!settings.phoneNumber) {
            throw new Error('Phone number is not configured');
          }
          await this.twilioClient.messages.create({
            body: `Your Vibewell verification code is: ${code}`,
            to: settings.phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
          });
          break;
        }
        case 'email': {
          if (!settings.email) {
            throw new Error('Email is not configured');
          }
          await this.emailTransport.sendMail({
            from: process.env.SMTP_FROM,
            to: settings.email,
            subject: 'Vibewell Verification Code',
            text: `Your verification code is: ${code}`,
            html: `<p>Your verification code is: <strong>${code}</strong></p>`
          });
          break;
        }
        default:
          throw new Error(`Cannot send code for method: ${method}`);
      }
    } catch (error) {
      logger.error('Failed to send MFA code', 'mfa', { error, userId, method });
      throw new Error('Failed to send MFA code');
    }
  }

  /**
   * Generate backup codes for a user
   */
  async generateBackupCodes(userId: string): Promise<string[]> {
    try {
      const settings = await this.getMFASettings(userId);
      if (!settings) {
        throw new Error('User has no MFA settings');
      }

      const codes = Array.from({ length: 10 }, () => this.generateCode(8));
      const hashedCodes = await Promise.all(
        codes.map(code => this.encryption.hash(code))
      );

      settings.backupCodes = hashedCodes;
      await this.storeMFASettings(userId, settings);

      return codes;
    } catch (error) {
      logger.error('Failed to generate backup codes', 'mfa', { error, userId });
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const settings = await this.getMFASettings(userId);
      if (!settings?.backupCodes?.length) {
        return false;
      }

      for (let i = 0; i < settings.backupCodes.length; i++) {
        const isValid = await this.encryption.verify(code, settings.backupCodes[i]);
        if (isValid) {
          // Remove the used backup code
          settings.backupCodes.splice(i, 1);
          await this.storeMFASettings(userId, settings);
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Failed to verify backup code', 'mfa', { error, userId });
      throw new Error('Failed to verify backup code');
    }
  }

  /**
   * Store MFA settings for a user
   */
  async storeMFASettings(userId: string, settings: MFASettings): Promise<void> {
    await this.redis.set(`mfa:settings:${userId}`, JSON.stringify(settings));
  }

  private generateCode(length: number = 6): string {
    return Array.from(
      { length },
      () => Math.floor(Math.random() * 10)
    ).join('');
  }

  /**
   * Get MFA settings for a user
   */
  async getMFASettings(userId: string): Promise<MFASettings | null> {
    const settings = await this.redis.get(`mfa:settings:${userId}`);
    return settings ? JSON.parse(settings) : null;
  }
} 