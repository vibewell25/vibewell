import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class TwoFactorService {
  // Generate a new 2FA secret for a user
  async generateSecret(userId: string): Promise<string> {
    const secret = authenticator.generateSecret();
    
    await prisma.twoFactorAuth.create({
      data: {
        userId,
        secret,
        backupCodes: this.generateBackupCodes(),
      },
    });

    return secret;
  }

  // Enable 2FA for a user
  async enable2FA(userId: string, token: string): Promise<boolean> {
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new Error('2FA secret not found');
    }

    const isValid = authenticator.verify({
      token,
      secret: twoFactorAuth.secret,
    });

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });
      return true;
    }

    return false;
  }

  // Verify a 2FA token
  async verify2FA(userId: string, token: string): Promise<boolean> {
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new Error('2FA not enabled for this user');
    }

    return authenticator.verify({
      token,
      secret: twoFactorAuth.secret,
    });
  }

  // Verify a backup code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth || !twoFactorAuth.backupCodes) {
      return false;
    }

    const backupCodes = twoFactorAuth.backupCodes as string[];
    const isValid = backupCodes.includes(code);

    if (isValid) {
      // Remove the used backup code
      const updatedBackupCodes = backupCodes.filter(c => c !== code);
      await prisma.twoFactorAuth.update({
        where: { userId },
        data: { backupCodes: updatedBackupCodes },
      });
    }

    return isValid;
  }

  // Disable 2FA for a user
  async disable2FA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    await prisma.twoFactorAuth.delete({
      where: { userId },
    });
  }

  // Generate backup codes
  private generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      codes.push(code);
    }
    return codes;
  }
} 