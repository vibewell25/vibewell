import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { MFAService } from '@/services/mfaService';
import { getServerSession } from 'next-auth';
import { Redis } from 'ioredis';
import { authOptions } from '@/lib/auth';

const SENSITIVE_ROUTES = [
  '/api/user/profile',
  '/api/user/settings',
  '/api/payments',
  '/api/admin'
];

const mfaService = new MFAService();
const redis = new Redis(process.env.REDIS_URL || '');

interface ExtendedRequest extends NextApiRequest {
  mfaVerified?: boolean;
}

export async function mfaMiddleware(
  req: ExtendedRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    // Check if the route requires MFA
    const requiresMFA = SENSITIVE_ROUTES.some(route => 
      req.url?.startsWith(route)
    );

    if (!requiresMFA) {
      return next();
    }

    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if MFA is verified for this session
    const sessionId = req.cookies['next-auth.session-token'];
    const mfaVerified = sessionId && await redis.get(`mfa:verified:${sessionId}`);
    if (mfaVerified) {
      req.mfaVerified = true;
      return next();
    }

    // Check if user has MFA enabled
    const settings = await mfaService.getMFASettings(session.user.id);
    if (!settings?.methods?.length) {
      // If MFA is not set up, redirect to MFA setup page
      return res.status(403).json({
        error: 'MFA Required',
        redirect: '/settings/security/mfa/setup'
      });
    }

    // If MFA is not verified, redirect to verification page
    return res.status(403).json({
      error: 'MFA Required',
      redirect: '/auth/mfa/verify',
      methods: settings.methods
    });
  } catch (error) {
    console.error('MFA middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export function withMFA(handler: any) {
  return async (req: ExtendedRequest, res: NextApiResponse) => {
    await mfaMiddleware(req, res, () => handler(req, res));
  };
} 