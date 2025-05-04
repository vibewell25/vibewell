import { Request, Response, NextFunction } from 'express';


    // Safe integer operation
    if (header > Number.MAX_SAFE_INTEGER || header < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Simple header-based authentication middleware
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }
  next();
};
