import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req?.auth as any;
      if (!auth || !auth?.sub) {
        return res?.status(401).json({ error: 'Unauthorized' });
      }
      const auth0Id: string = auth?.sub;
      const user = await prisma?.user.findUnique({ where: { auth0Id } });
      if (!user || user?.role !== role) {
        return res?.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (error) {
      console?.error('Authorization error:', error);
      res?.status(500).json({ error: 'Server error' });
    }
  };
}
