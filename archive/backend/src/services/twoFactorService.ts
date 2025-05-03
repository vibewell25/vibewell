import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import redis from './redis';

// Prefix for Redis keys to avoid collisions
const REDIS_KEY_PREFIX = 'vibewell:2fa:temp:';
// Expiration time for temporary secrets (30 minutes)
const TEMP_SECRET_TTL = 30 * 60; // seconds

export class TwoFactorService {
  private static instance: TwoFactorService;

  private constructor() {}

  public static getInstance(): TwoFactorService {
    if (!TwoFactorService.instance) {
      TwoFactorService.instance = new TwoFactorService();
    }
    return TwoFactorService.instance;
  }

  public async generateSecretKey(userId: string, email: string): Promise<{ secretKey: string; qrCodeUrl: string }> {
    // Generate a secret key
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Vibewell:${email}`
    });

    // Generate QR code
    const otpauthUrl = secret.otpauth_url;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl || '');

    // Store the secret temporarily in Redis
    await this.storeTemporarySecret(userId, secret.base32);

    return {
      secretKey: secret.base32,
      qrCodeUrl
    };
  }

  public async verifyCode(userId: string, code: string): Promise<boolean> {
    // Get the user's temporary secret from Redis
    const secret = await this.getTemporarySecret(userId);
    if (!secret) {
      throw new Error('No secret found for user');
    }

    // Verify the code
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 1 // Allow 1 step before/after for time drift
    });
  }

  public generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      // Generate a random 8-character backup code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  public async enable2FA(userId: string): Promise<void> {
    const secret = await this.getTemporarySecret(userId);
    if (!secret) {
      throw new Error('No secret found for user');
    }

    // Store the secret permanently in the user's record
    await this.storePermanentSecret(userId, secret);

    // Clear the temporary secret from Redis
    await this.clearTemporarySecret(userId);
  }

  private async storeTemporarySecret(userId: string, secret: string): Promise<void> {
    // Store in Redis with expiration time
    await redis.set(`${REDIS_KEY_PREFIX}${userId}`, secret, 'EX', TEMP_SECRET_TTL);
  }

  private async getTemporarySecret(userId: string): Promise<string | null> {
    // Get from Redis
    return await redis.get(`${REDIS_KEY_PREFIX}${userId}`);
  }

  private async clearTemporarySecret(userId: string): Promise<void> {
    // Remove from Redis
    await redis.del(`${REDIS_KEY_PREFIX}${userId}`);
  }

  private async storePermanentSecret(userId: string, secret: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          'twoFactor.enabled': true,
          'twoFactor.secret': secret,
          'twoFactor.backupCodes': this.generateBackupCodes()
        }
      }
    );
  }
} 