
import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';

import { AppError, handleError } from '../utils/error';

import { generateRandomString } from '../utils/crypto';

export class TwoFactorService {
  constructor(private prisma: PrismaClient) {}

  async enable2FA(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.twoFactorEnabled) {
        throw new AppError('2FA is already enabled', 400);
      }

      const secret = authenticator.generateSecret();

      await this.prisma.twoFactorAuth.create({
        data: {
          userId,
          secret,
          verified: false,
        },
      });

      // Generate backup codes
      const backupCodes = await this.generateBackupCodes(userId);

      return {
        secret,
        backupCodes,
        otpAuthUrl: authenticator.keyuri(
          user.email || user.id,
          'Vibewell',
          secret
        ),
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async verify2FA(userId: string, token: string) {
    try {
      const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!twoFactorAuth) {
        throw new AppError('2FA is not enabled', 400);
      }

      const isValid = authenticator.verify({
        token,
        secret: twoFactorAuth.secret,
      });

      if (!isValid) {
        throw new AppError('Invalid 2FA token', 401);
      }

      if (!twoFactorAuth.verified) {

        // First successful verification - enable 2FA
        await this.prisma.$transaction([
          this.prisma.twoFactorAuth.update({
            where: { userId },
            data: { verified: true },
          }),
          this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
          }),
        ]);
      }

      return { verified: true };
    } catch (error) {
      throw handleError(error);
    }
  }

  async disable2FA(userId: string) {
    try {
      const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
        where: { userId },
      });

      if (!twoFactorAuth) {
        throw new AppError('2FA is not enabled', 400);
      }

      await this.prisma.$transaction([
        this.prisma.twoFactorAuth.delete({
          where: { userId },
        }),
        this.prisma.backupCode.deleteMany({
          where: { userId },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: false },
        }),
      ]);

      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  }

  async verifyBackupCode(userId: string, code: string) {
    try {
      const backupCode = await this.prisma.backupCode.findFirst({
        where: {
          userId,
          code,
          used: false,
        },
      });

      if (!backupCode) {
        throw new AppError('Invalid backup code', 401);
      }

      await this.prisma.backupCode.update({
        where: { id: backupCode.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      return { verified: true };
    } catch (error) {
      throw handleError(error);
    }
  }

  private async generateBackupCodes(userId: string, count = 10) {
    const codes: string[] = [];
    
    for (let i = 0; i < count; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      codes.push(generateRandomString(16));
    }

    await this.prisma.backupCode.createMany({
      data: codes.map(code => ({
        userId,
        code,
        used: false,
      })),
    });

    return codes;
  }

  async regenerateBackupCodes(userId: string) {
    try {
      // Delete existing unused backup codes
      await this.prisma.backupCode.deleteMany({
        where: {
          userId,
          used: false,
        },
      });

      // Generate new backup codes
      const codes = await this.generateBackupCodes(userId);

      return { backupCodes: codes };
    } catch (error) {
      throw handleError(error);
    }
  }

  async listBackupCodes(userId: string) {
    try {
      const codes = await this.prisma.backupCode.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return codes;
    } catch (error) {
      throw handleError(error);
    }
  }
} 