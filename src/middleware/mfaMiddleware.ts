import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getSession } from 'next-auth/react';
import { Redis } from 'ioredis';
import { authOptions } from '@/lib/auth';

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
  async isMFAEnabled(email: string): Promise<boolean> {
    // TODO: Implement actual MFA check logic
    return false;
  }

  async verifyMFA(email: string): Promise<boolean> {
    // TODO: Implement actual MFA verification logic
    return false;
  }
}

const SENSITIVE_ROUTES = [
  '/api/admin',
  '/api/settings',
  // Add other sensitive routes that require MFA
];

const mfaService = new MFAService();
const redis = new Redis(process.env.REDIS_URL || '');

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

    const isSensitiveRoute = SENSITIVE_ROUTES.some((route) =>
      req.url?.startsWith(route)
    );

    if (!isSensitiveRoute) {
      return next();
    }

    const isMFAEnabled = await mfaService.isMFAEnabled(session.user.email);

    if (!isMFAEnabled) {
      return next();
    }

    if (!req.mfaVerified) {
      throw new MFARequiredError();
    }

    const isVerified = await mfaService.verifyMFA(session.user.email);
    if (!isVerified) {
      throw new MFAVerificationError();
    }

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
        code: error.code 
      });
    }
    
    console.error('Unexpected error in MFA middleware:', error);
    return res.status(500).json({ 
      error: 'Internal server error during MFA verification',
      code: 'INTERNAL_SERVER_ERROR'
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
        const isVerified = await mfaService.verifyMFA(session.user.email);
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