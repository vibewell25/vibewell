import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MFAService, MFAMethod } from '@/services/mfaService';
import { Redis } from 'ioredis';

const mfaService = new MFAService();
const redis = new Redis(process.env.REDIS_URL || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { method, code } = req.body;

    if (!method || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the MFA code
    const isValid = await mfaService.verifyCode(
      session.user.id,
      method as MFAMethod,
      code
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    // Mark the session as MFA verified
    const sessionId = req.cookies['next-auth.session-token'];
    if (sessionId) {
      // Store MFA verification status for 12 hours
      await redis.set(
        `mfa:verified:${sessionId}`,
        'true',
        'EX',
        12 * 60 * 60
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('MFA verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 