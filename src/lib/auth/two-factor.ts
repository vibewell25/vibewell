/**
 * Two-factor authentication module
 */
import * as speakeasy from 'speakeasy';
import * as crypto from 'crypto';
import prisma from '../prisma';

/**
 * User two-factor authentication settings
 */
export interface TwoFactorSettings {
  enabled: boolean;
  secret?: string;
  recoveryKeys?: string[];
}

/**
 * Generates a new TOTP secret for a user
 */
export function generateTOTPSecret(): string {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret.base32;
}

/**
 * Verifies a TOTP token against a user's secret
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });
}

/**
 * Generates recovery keys for a user
 */
export function generateRecoveryKeys(count: number = 10): string[] {
  return Array.from({ length: count }, () => 
    crypto.randomBytes(10).toString('hex')
  );
}

/**
 * Verifies a recovery key
 */
export function verifyRecoveryKey(key: string, validKeys: string[]): boolean {
  return validKeys.includes(key);
}

/**
 * Enables two-factor authentication for a user
 */
export async function enableTwoFactor(userId: string): Promise<TwoFactorSettings> {
  const secret = generateTOTPSecret();
  const recoveryKeys = generateRecoveryKeys();
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorRecoveryKeys: recoveryKeys
    }
  });
  
  return {
    enabled: true,
    secret,
    recoveryKeys
  };
}

/**
 * Disables two-factor authentication for a user
 */
export async function disableTwoFactor(userId: string): Promise<TwoFactorSettings> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryKeys: []
    }
  });
  
  return {
    enabled: false
  };
} 