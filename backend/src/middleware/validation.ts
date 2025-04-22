import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

export const twoFactorValidation = {
  verifyCode: [
    body('code')
      .isString()
      .isLength({ min: 6, max: 6 })
      .matches(/^\d+$/)
      .withMessage('Code must be exactly 6 digits'),
    validate
  ]
}; 