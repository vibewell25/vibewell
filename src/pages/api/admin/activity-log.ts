import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);

    // Check authentication and admin status
    if (!session?.user || !session.user.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const { action, path, timestamp } = req.body;

      // Here you would typically save this to your database
      // For now, we'll just log it and return success
      console.log('Admin Activity:', {
        userId: session.user.sub,
        userEmail: session.user.email,
        action,
        path,
        timestamp,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Activity log error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 