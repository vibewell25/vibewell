
import { prisma } from '@/lib/prisma';

import { EmailService } from '@/lib/email';
import { randomBytes } from 'crypto';

import { addHours } from 'date-fns';

export class EmailVerificationService {
  private static TOKEN_EXPIRY_HOURS = 24;

  /**
   * Generate a secure random token for email verification
   */
  private static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create and send a verification email
   */
  static async sendVerificationEmail(userId: string, email: string): Promise<void> {
    try {
      // Delete any existing verification tokens for this user
      await prisma.emailVerification.deleteMany({
        where: { userId },
      });

      // Create new verification token
      const token = this.generateToken();
      const expiresAt = addHours(new Date(), this.TOKEN_EXPIRY_HOURS);

      // Save verification token
      await prisma.emailVerification.create({
        data: {
          token,
          userId,
          email,
          expiresAt,
        },
      });

      // Generate verification URL

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

      // Send verification email
      await EmailService.send({
        to: email,

        subject: 'Verify Your Email - VibeWell',
        html: `
          <h1>Welcome to VibeWell!</h1>
          <p>Please verify your email address by clicking the button below:</p>





          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in ${this.TOKEN_EXPIRY_HOURS} hours.</p>
          <p>If you didn't create an account with VibeWell, please ignore this email.</p>
        `,
        text: `
          Welcome to VibeWell!
          
          Please verify your email address by visiting this URL:
          ${verificationUrl}
          
          This link will expire in ${this.TOKEN_EXPIRY_HOURS} hours.
          
          If you didn't create an account with VibeWell, please ignore this email.
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Verify email using token
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find verification record
      const verification = await prisma.emailVerification.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verification) {
        return { success: false, error: 'Invalid verification token' };
      }

      if (verification.expiresAt < new Date()) {
        // Delete expired token
        await prisma.emailVerification.delete({
          where: { token },
        });
        return { success: false, error: 'Verification token has expired' };
      }

      // Update user's email verification status
      await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      });

      // Delete used token
      await prisma.emailVerification.delete({
        where: { token },
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.emailVerified) {
        return { success: false, error: 'Email is already verified' };
      }

      await this.sendVerificationEmail(user.id, user.email);
      return { success: true };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }
}
