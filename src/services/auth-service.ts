import { supabase } from '@/lib/supabase';
import { User, Session, Factor } from '@supabase/supabase-js';
import redisClient from '@/lib/redis-client';

// Define the supported MFA factors
export type MFAFactorType = 'totp' | 'phone';

export interface MFAFactor {
  id: string;
  type: MFAFactorType;
  friendlyName: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface VerifyMFAParams {
  factorId: string;
  code: string;
  userId: string;
}

// Rate limit configuration for MFA operations
const MFA_RATE_LIMITS = {
  ENROLL: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 MFA enrollments per hour
    prefix: 'ratelimit:mfa:enroll:',
  },
  VERIFY: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 MFA verification attempts per 15 minutes
    prefix: 'ratelimit:mfa:verify:',
  },
  UNENROLL: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 2, // 2 MFA unenrollments per 24 hours
    prefix: 'ratelimit:mfa:unenroll:',
  },
};

export class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, metadata: Record<string, any> = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Sign in a user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Check if MFA is required for this user
    const requiresMFA = await this.doesUserRequireMFA(data.user);
    
    return {
      ...data,
      requiresMFA,
    };
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Reset a password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  }

  /**
   * Get the current user and session
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!user) return { user: null, session: null, requiresMFA: false };
    
    // Check if MFA is required but not completed for the session
    const requiresMFA = await this.doesUserRequireMFA(user);
    
    // Check if MFA was already completed in this session
    // Note: The actual structure of the session may vary, this should be adjusted based on Supabase's Session structure
    const mfaCompleted = session?.user.app_metadata?.mfa_completed || false;
    
    return {
      user,
      session,
      requiresMFA: requiresMFA && !mfaCompleted,
    };
  }

  /**
   * Check if a user requires MFA
   * In this implementation, all users with admin role require MFA
   */
  private async doesUserRequireMFA(user: User | null): Promise<boolean> {
    if (!user) return false;
    
    // Get user role from metadata
    const userRole = user.user_metadata?.role || 'customer';
    
    // Admin users require MFA
    return userRole === 'admin';
  }

  /**
   * Check if an operation is rate limited
   * @param userId The user ID to check rate limiting for
   * @param operationType The type of MFA operation to check
   * @returns True if the operation is rate limited, false otherwise
   */
  private async isRateLimited(userId: string, operationType: 'ENROLL' | 'VERIFY' | 'UNENROLL'): Promise<boolean> {
    try {
      // Only apply rate limiting in production
      if (process.env.NODE_ENV !== 'production') {
        return false; // Skip rate limiting in development
      }

      const limits = MFA_RATE_LIMITS[operationType];
      const key = `${limits.prefix}${userId}`;
      const windowKey = `${key}:window`;
      
      const now = Date.now();
      
      // Get current count and window expiration
      const [countStr, windowExpires] = await Promise.all([
        redisClient.get(key),
        redisClient.get(windowKey),
      ]);
      
      // If window doesn't exist or has expired, create a new one
      if (!windowExpires || parseInt(windowExpires, 10) < now) {
        const resetTime = now + limits.windowMs;
        await Promise.all([
          redisClient.set(key, '1'),
          redisClient.set(windowKey, resetTime.toString(), { ex: Math.ceil(limits.windowMs / 1000) }),
        ]);
        
        return false; // Not rate limited
      }
      
      // Check if over limit
      const count = countStr ? parseInt(countStr, 10) : 0;
      if (count >= limits.max) {
        return true; // Rate limited
      }
      
      // Increment counter
      await redisClient.incr(key);
      
      return false; // Not rate limited
    } catch (error) {
      console.error('Rate limiting error:', error);
      return false; // Fail open on errors
    }
  }

  /**
   * Enroll a new MFA factor (e.g., TOTP app)
   */
  async enrollMFAFactor(type: MFAFactorType, friendlyName: string) {
    // Ensure the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to enroll MFA');
    
    // Check if the operation is rate limited
    const isLimited = await this.isRateLimited(user.id, 'ENROLL');
    if (isLimited) {
      throw new Error('Too many MFA enrollment attempts. Please try again later.');
    }
    
    // For TOTP (authenticator app)
    if (type === 'totp') {
      // This is a simplified version. In a real implementation, 
      // you would integrate with a library like otplib to generate secrets.
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });
      
      if (error) throw error;
      
      return {
        factorId: data.id,
        qrCode: data.totp.qr_code, // QR code to scan with authenticator app
        secret: data.totp.secret, // Secret key for manual entry
      };
    }
    
    // For phone factor (simplified example)
    if (type === 'phone') {
      // Phone MFA would require additional server-side implementation
      // This is just a placeholder for the interface
      throw new Error('Phone MFA not implemented yet');
    }
    
    throw new Error(`Unsupported MFA factor type: ${type}`);
  }

  /**
   * Verify an MFA code
   */
  async verifyMFA({ factorId, code, userId }: VerifyMFAParams) {
    // Check if the operation is rate limited
    const isLimited = await this.isRateLimited(userId, 'VERIFY');
    if (isLimited) {
      throw new Error('Too many MFA verification attempts. Please try again later.');
    }
    
    // Verify the TOTP code
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
    });
    
    if (error) throw error;
    
    // Verify the challenge with the code
    const verifyResult = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code,
    });
    
    if (verifyResult.error) throw verifyResult.error;
    
    return verifyResult.data;
  }

  /**
   * Unenroll an MFA factor
   */
  async unenrollMFAFactor(factorId: string) {
    // Ensure the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to unenroll MFA');
    
    // Check if the operation is rate limited
    const isLimited = await this.isRateLimited(user.id, 'UNENROLL');
    if (isLimited) {
      throw new Error('Too many MFA unenrollment attempts. Please try again later.');
    }
    
    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    
    if (error) throw error;
  }

  /**
   * Get all MFA factors for the current user
   */
  async getMFAFactors(): Promise<MFAFactor[]> {
    const { data, error } = await supabase.auth.mfa.listFactors();
    
    if (error) throw error;
    
    // Combine both TOTP and phone factors if present
    const factors = [...(data.totp || []), ...(data.phone || [])];
    
    return factors.map(factor => ({
      id: factor.id,
      // Use factor_type property from the Factor interface
      type: factor.factor_type as MFAFactorType,
      friendlyName: factor.friendly_name || 'Unnamed Factor',
      createdAt: new Date(factor.created_at),
      // Use created_at as last_used_at if not available
      lastUsedAt: factor.updated_at ? new Date(factor.updated_at) : undefined,
    }));
  }

  /**
   * Check if a user has a specific role
   */
  hasRole(user: User | null, role: string | string[]): boolean {
    if (!user) return false;
    
    const userRole = user.user_metadata?.role || 'customer';
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  }

  /**
   * Reset MFA rate limits for a user (for administrative purposes)
   */
  async resetMFARateLimits(userId: string, adminUserId: string) {
    // Only admins can reset rate limits
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !this.hasRole(user, 'admin')) {
      throw new Error('Only administrators can reset rate limits');
    }
    
    // Log the action for security audit
    console.log(`Admin ${adminUserId} reset MFA rate limits for user ${userId}`);
    
    // Delete all rate limit keys for this user
    if (process.env.NODE_ENV === 'production') {
      try {
        const enrollKey = `${MFA_RATE_LIMITS.ENROLL.prefix}${userId}`;
        const verifyKey = `${MFA_RATE_LIMITS.VERIFY.prefix}${userId}`;
        const unenrollKey = `${MFA_RATE_LIMITS.UNENROLL.prefix}${userId}`;
        
        await Promise.all([
          redisClient.del(enrollKey),
          redisClient.del(`${enrollKey}:window`),
          redisClient.del(verifyKey),
          redisClient.del(`${verifyKey}:window`),
          redisClient.del(unenrollKey),
          redisClient.del(`${unenrollKey}:window`),
        ]);
      } catch (error) {
        console.error('Error resetting MFA rate limits:', error);
        throw new Error('Failed to reset rate limits');
      }
    }
    
    return { success: true };
  }
}

// Create and export a singleton instance of the auth service
export const authService = new AuthService(); 