import { NextApiRequest, NextApiResponse, NextApiHandler } from '@/types/api';
import { getSession } from 'next-auth/react';
import { Redis } from 'ioredis';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTOTP, verifyTOTP } from '@/lib/totp';

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

      return !!user?.mfaEnabled;
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

      if (!user?.mfaSecret) {
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

export const mfaMiddleware = async (
  req: ExtendedRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) => {
  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized: No session found' });
    }

    const isSensitiveRoute = SENSITIVE_ROUTES.some(route => req.url?.startsWith(route));

    if (!isSensitiveRoute) {
      return next();
    }

    const isMFAEnabled = await mfaService.isMFAEnabled(session.user.email);

    if (!isMFAEnabled) {
      return next();
    }

    // Check for MFA token in request headers or body
    const mfaToken = (req.headers['x-mfa-token'] as string) || req.body?.mfaToken;

    const isVerified = await mfaService.verifyMFA(session.user.email, mfaToken);
    if (!isVerified) {
      throw new MFARequiredError();
    }

    req.mfaVerified = true;
    return next();
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      'statusCode' in error &&
      (error instanceof MFARequiredError || error instanceof MFAVerificationError)
    ) {
      console.error(`MFA Error: ${error.code} - ${error.message}`);
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
    }

    console.error('Unexpected error in MFA middleware:', error);
    return res.status(500).json({
      error: 'Internal server error during MFA verification',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

export const withMFA = (handler: NextApiHandler): NextApiHandler => {
  return async (req: ExtendedRequest, res: NextApiResponse) => {
    try {
      const session = await getSession({ req });
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized: No session found' });
      }

      const isMFAEnabled = await mfaService.isMFAEnabled(session.user.email);
      if (isMFAEnabled) {
        // Check for MFA token in request headers or body
        const mfaToken = (req.headers['x-mfa-token'] as string) || req.body?.mfaToken;

        const isVerified = await mfaService.verifyMFA(session.user.email, mfaToken);
        if (!isVerified) {
          throw new MFARequiredError();
        }
        req.mfaVerified = true;
      }

      return handler(req, res);
    } catch (error) {
      if (error instanceof MFARequiredError) {
        return res.status(403).json({ error: error.message, code: error.code });
      }
      throw error;
    }
  };
};
