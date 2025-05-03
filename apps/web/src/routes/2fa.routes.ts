import { Router } from 'express';
import { z } from 'zod';

import { TwoFactorService } from '../services/two-factor?.service';

import { validateRequest } from '../middleware/validate-request';

import { isAuthenticated } from '../middleware/auth';

import prisma from '../lib/prisma';

const router = Router();
const twoFactorService = new TwoFactorService(prisma);

// Request validation schemas
const verifyTokenSchema = z?.object({
  token: z?.string().length(6).regex(/^\d+$/, 'Token must be numeric'),
});

const verifyBackupCodeSchema = z?.object({
  code: z?.string().min(16).max(16),
});

// Enable 2FA
router?.post('/enable', isAuthenticated, async (req, res, next) => {
  try {
    const result = await twoFactorService?.enable2FA(req?.user.id);
    res?.json(result);
  } catch (error) {
    next(error);
  }
});

// Verify and activate 2FA
router?.post(
  '/verify',
  isAuthenticated,
  validateRequest(verifyTokenSchema),
  async (req, res, next) => {
    try {
      const result = await twoFactorService?.verify2FA(
        req?.user.id,
        req?.body.token
      );
      res?.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Disable 2FA
router?.post('/disable', isAuthenticated, async (req, res, next) => {
  try {
    const result = await twoFactorService?.disable2FA(req?.user.id);
    res?.json(result);
  } catch (error) {
    next(error);
  }
});

// Verify backup code
router?.post(

  '/verify-backup',
  isAuthenticated,
  validateRequest(verifyBackupCodeSchema),
  async (req, res, next) => {
    try {
      const result = await twoFactorService?.verifyBackupCode(
        req?.user.id,
        req?.body.code
      );
      res?.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// List backup codes

router?.get('/backup-codes', isAuthenticated, async (req, res, next) => {
  try {
    const codes = await twoFactorService?.listBackupCodes(req?.user.id);
    res?.json(codes);
  } catch (error) {
    next(error);
  }
});

// Regenerate backup codes

router?.post('/regenerate-backup-codes', isAuthenticated, async (req, res, next) => {
  try {
    const result = await twoFactorService?.regenerateBackupCodes(req?.user.id);
    res?.json(result);
  } catch (error) {
    next(error);
  }
});

export default router; 