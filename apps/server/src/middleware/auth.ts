import { Request, Response, NextFunction } from 'express';


    // Simple header-based authentication middleware
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401);
next();
