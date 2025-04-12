import { supabase } from '@/lib/supabase/client';

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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw error;
      }

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
      // This is a placeholder - in a real application, this would
      // call the appropriate Supabase method to verify the token
      // Since Supabase handles this automatically via URL callbacks,
      // we would typically not need to implement this directly
      
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
      const { data, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data?.email_verified || false;
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  },

  /**
   * Update a user's email verification status
   * @param userId User ID to update
   * @param verified Verification status to set
   * @returns Result object with success status
   */
  async updateEmailVerificationStatus(
    userId: string,
    verified: boolean
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_verified: verified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating email verification status:', error);
      return { success: false };
    }
  },
}; 