
import { NextApiRequest, NextApiResponse, NextApiHandler } from '@/types/api';

import { getSession } from 'next-auth/react';
import { Redis } from 'ioredis';

import { prisma } from '@/lib/prisma';

import { verifyTOTP } from '@/lib/totp';

interface ExtendedRequest extends NextApiRequest {
  mfaVerified?: boolean;
}

interface MFAError extends Error {
  code: string;
  statusCode: number;
}

class MFARequiredError extends Error implements MFAError {
  code: string;
  statusCode: number;

  constructor() {
    super('MFA verification required');
    this.name = 'MFARequiredError';
    this.code = 'MFA_REQUIRED';
    this.statusCode = 403;
  }
}

class MFAVerificationError extends Error implements MFAError {
  code: string;
  statusCode: number;

  constructor() {
    super('MFA verification failed');
    this.name = 'MFAVerificationError';
    this.code = 'MFA_VERIFICATION_FAILED';
    this.statusCode = 401;
  }
}

class MFAService {
  private redis: Redis;

  constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }

  async isMFAEnabled(email: string): Promise<boolean> {
    try {
      // Check if the user has MFA enabled in their profile
      const user = await prisma.user.findUnique({
        where: { email },
        select: { mfaEnabled: true, id: true },
      });

      return !!user.mfaEnabled;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  async verifyMFA(email: string, token?: string): Promise<boolean> {
    if (!token) {
      // If no token provided, check if this session has been verified within the time window
      const hasVerifiedSession = await this.checkVerifiedSession(email);
      return hasVerifiedSession;
    }

    try {
      // Find user with this email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, mfaSecret: true },
      });

      if (!user.mfaSecret) {
        return false;
      }

      // Verify the provided TOTP token
      const isValid = verifyTOTP(token, user.mfaSecret);

      if (isValid) {
        // Store successful verification in Redis with 30-minute expiry
        await this.storeVerifiedSession(email);
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      return false;
    }
  }

  private async storeVerifiedSession(email: string): Promise<void> {
    const key = `mfa:verified:${email}`;
    await this.redis.set(key, 'true', 'EX', 1800); // 30 minute expiry
  }

  private async checkVerifiedSession(email: string): Promise<boolean> {
    const key = `mfa:verified:${email}`;
    const verified = await this.redis.get(key);
    return verified === 'true';
  }
}

const SENSITIVE_ROUTES = [

  '/api/admin',

  '/api/settings',
  // Add other sensitive routes that require MFA
];

const redis = new Redis(process.env.REDIS_URL || '');
const mfaService = new MFAService(redis);

export {};

export {};
