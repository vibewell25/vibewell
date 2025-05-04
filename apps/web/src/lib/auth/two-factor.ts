import { authenticator } from 'otplib';

import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export class TwoFactorService {
  private static readonly issuer = 'Vibewell';

  public async setupTwoFactor(userId: string, email: string): Promise<TwoFactorSetupResponse> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, this.constructor.issuer, secret);

    // Hash the secret before storing
    const hashedSecret = createHash('sha256').update(secret).digest('hex');

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: hashedSecret,
        twoFactorEnabled: false // Will be enabled after verification
      }
    });

    return {
      secret,
      qrCodeUrl: otpauth
    };
  }

  public async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true }
    });

    if (!user.twoFactorSecret) {
      throw new Error('2FA not set up for this user');
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (isValid) {
      // Enable 2FA after successful verification
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true }
      });
    }

    return isValid;
  }

  public async validateLogin(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user.twoFactorEnabled) {
      return true; // 2FA not required
    }

    if (!user.twoFactorSecret) {
      throw new Error('2FA configuration error');
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });
  }

  public async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    const isValid = await this.validateLogin(userId, token);

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: null,
          twoFactorEnabled: false
        }
      });
    }

    return isValid;
  }
} 