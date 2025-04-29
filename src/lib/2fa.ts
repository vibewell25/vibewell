import { authenticator } from 'otplib';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export class TwoFactorError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TwoFactorError';
  }
}

export async function generateTOTPSecret(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new TwoFactorError('User not found', 'USER_NOT_FOUND');
  }

  if (user.twoFactorEnabled) {
    throw new TwoFactorError('2FA is already enabled', '2FA_ALREADY_ENABLED');
  }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    user.email || userId,
    'Vibewell',
    secret
  );

  // Store secret temporarily until verified
  await prisma.twoFactorAuth.create({
    data: {
      userId,
      secret,
      verified: false
    }
  });

  // Generate QR code
  const qrCode = await QRCode.toDataURL(otpauth);

  return {
    secret,
    qrCode,
    otpauth
  };
}

export async function verifyAndEnableTOTP(userId: string, token: string) {
  const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
    where: { userId }
  });

  if (!twoFactorAuth) {
    throw new TwoFactorError('2FA setup not initiated', '2FA_NOT_INITIATED');
  }

  if (twoFactorAuth.verified) {
    throw new TwoFactorError('2FA is already verified', '2FA_ALREADY_VERIFIED');
  }

  const isValid = authenticator.verify({
    token,
    secret: twoFactorAuth.secret
  });

  if (!isValid) {
    throw new TwoFactorError('Invalid token', 'INVALID_TOKEN');
  }

  // Enable 2FA
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorAuth.secret
      }
    }),
    prisma.twoFactorAuth.update({
      where: { userId },
      data: { verified: true }
    })
  ]);

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );

  await prisma.backupCode.createMany({
    data: backupCodes.map(code => ({
      userId,
      code,
      used: false
    }))
  });

  return { success: true, backupCodes };
}

export async function verifyTOTP(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new TwoFactorError('User not found', 'USER_NOT_FOUND');
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new TwoFactorError('2FA is not enabled', '2FA_NOT_ENABLED');
  }

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret
  });

  if (!isValid) {
    // Check if it's a backup code
    const backupCode = await prisma.backupCode.findFirst({
      where: {
        userId,
        code: token,
        used: false
      }
    });

    if (backupCode) {
      // Mark backup code as used
      await prisma.backupCode.update({
        where: { id: backupCode.id },
        data: { 
          used: true,
          usedAt: new Date()
        }
      });
      return { success: true, method: 'BACKUP_CODE' };
    }

    throw new TwoFactorError('Invalid token', 'INVALID_TOKEN');
  }

  return { success: true, method: 'TOTP' };
}

export async function disableTOTP(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new TwoFactorError('User not found', 'USER_NOT_FOUND');
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new TwoFactorError('2FA is not enabled', '2FA_NOT_ENABLED');
  }

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret
  });

  if (!isValid) {
    throw new TwoFactorError('Invalid token', 'INVALID_TOKEN');
  }

  // Disable 2FA
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    }),
    prisma.twoFactorAuth.delete({
      where: { userId }
    }),
    prisma.backupCode.deleteMany({
      where: { userId }
    })
  ]);

  return { success: true };
}

export async function generateNewBackupCodes(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new TwoFactorError('User not found', 'USER_NOT_FOUND');
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new TwoFactorError('2FA is not enabled', '2FA_NOT_ENABLED');
  }

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret
  });

  if (!isValid) {
    throw new TwoFactorError('Invalid token', 'INVALID_TOKEN');
  }

  // Generate new backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );

  await prisma.$transaction([
    // Delete old backup codes
    prisma.backupCode.deleteMany({
      where: { userId }
    }),
    // Create new backup codes
    prisma.backupCode.createMany({
      data: backupCodes.map(code => ({
        userId,
        code,
        used: false
      }))
    })
  ]);

  return { success: true, backupCodes };
} 