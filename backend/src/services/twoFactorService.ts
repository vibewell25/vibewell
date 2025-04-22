import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';

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

    // Store the secret temporarily (should be in a secure temporary storage)
    await this.storeTemporarySecret(userId, secret.base32);

    return {
      secretKey: secret.base32,
      qrCodeUrl
    };
  }

  public async verifyCode(userId: string, code: string): Promise<boolean> {
    // Get the user's temporary secret
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

    // Clear the temporary secret
    await this.clearTemporarySecret(userId);
  }

  private async storeTemporarySecret(userId: string, secret: string): Promise<void> {
    // TODO: Store in Redis or another temporary storage
    // For now, we'll use a mock implementation
    await User.updateOne(
      { _id: userId },
      { $set: { 'twoFactor.temporarySecret': secret } }
    );
  }

  private async getTemporarySecret(userId: string): Promise<string | null> {
    // TODO: Get from Redis or another temporary storage
    // For now, we'll use a mock implementation
    const user = await User.findById(userId);
    return user?.twoFactor?.temporarySecret || null;
  }

  private async clearTemporarySecret(userId: string): Promise<void> {
    // TODO: Remove from Redis or another temporary storage
    // For now, we'll use a mock implementation
    await User.updateOne(
      { _id: userId },
      { $unset: { 'twoFactor.temporarySecret': 1 } }
    );
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