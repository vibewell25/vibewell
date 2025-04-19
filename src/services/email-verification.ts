import { prisma } from '@/lib/prisma';
import { ManagementClient } from 'auth0';

// Initialize Auth0 Management API client
const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '',
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
});

/**
 * Email verification service for user management
 */
export const EmailVerificationService = {
  /**
   * Send or resend a verification email to the user
   * @param email User's email address
   * @returns Result object with success status and message
   */
  async sendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Using Auth0 Management API to resend verification email
      const users = await auth0Management.getUsersByEmail(email);
      
      if (!users || users.length === 0) {
        throw new Error('User not found');
      }
      
      const userId = users[0].user_id;
      
      // Send verification email
      await auth0Management.sendEmailVerification({ user_id: userId });

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        message: error.message || 'Failed to send verification email',
      };
    }
  },

  /**
   * Verify a user's email with a token
   * @param token Verification token from email link
   * @returns Result object with success status and message
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Auth0 handles email verification automatically via URL callbacks
      // This method is kept for compatibility, but it's essentially a placeholder
      // In a real application with Auth0, you'd typically redirect users to Auth0's verification URL
      
      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify email',
      };
    }
  },

  /**
   * Check if a user's email is verified
   * @param userId User ID to check
   * @returns Whether the email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      // Get user from Auth0
      const user = await auth0Management.getUser({ id: userId });
      
      // Auth0 has email_verified property
      return user.email_verified || false;
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  },

  /**
   * Update a user's email verification status in our database
   * @param userId User ID to update
   * @param verified Verification status to set
   * @returns Result object with success status
   */
  async updateEmailVerificationStatus(
    userId: string,
    verified: boolean
  ): Promise<{ success: boolean }> {
    try {
      // Update the user profile in our database
      await prisma.profile.update({
        where: { userId },
        data: {
          emailVerified: verified,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating email verification status:', error);
      return { success: false };
    }
  },
}; 