import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

    import { User, IUser } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
export const authenticateToken = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
req.user = user;
    next();
catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
console.error('Error authenticating token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
