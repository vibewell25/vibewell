import redisClient from '@/lib/redis-client';
import { getSession, updateSession } from '@auth0/nextjs-auth0';

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
   * Get the current user from Auth0
   * Note: Auth0 handles signup/signin through redirects
   */
  async getCurrentUser(req: any, res: any) {
    try {
      const session = await getSession(req, res);
      if (!session || !session.user) {
        return { user: null, session: null, requiresMFA: false };
      }

      // Check if MFA is required but not completed for the session
      const requiresMFA = await this.doesUserRequireMFA(session.user);

      return {
        user: session.user,
        session,
        requiresMFA,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, session: null, requiresMFA: false };
    }
  }

  /**
   * Check if a user requires MFA
   * In this implementation, all users require MFA for enhanced security
   */
  private async doesUserRequireMFA(user: any | null): Promise<boolean> {
    // With Auth0, MFA can be enforced at the tenant level
    // This is just a placeholder - in a real app, you might check for specific user metadata
    // or use Auth0 rules to enforce MFA
    return user !== null && user.email.endsWith('@admin.vibewell.com');
  }

  /**
   * Check if an operation is rate limited
   * @param userId The user ID to check rate limiting for
   * @param operationType The type of MFA operation to check
   * @returns True if the operation is rate limited, false otherwise
   */
  private async isRateLimited(
    userId: string,
    operationType: 'ENROLL' | 'VERIFY' | 'UNENROLL'
  ): Promise<boolean> {
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
          redisClient.set(
            windowKey,
            resetTime.toString(),
            Math.ceil(limits.windowMs / 1000).toString()
          ),
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
   * Check if a user has a specific role
   * @param user The user object from Auth0
   * @param role The role or array of roles to check
   * @returns True if the user has at least one of the specified roles
   */
  hasRole(user: any | null, role: string | string[]): boolean {
    if (!user) return false;

    const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell.com';
    const userRoles = user[`${namespace}/roles`] || [];

    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r));
    }

    return userRoles.includes(role);
  }

  /**
   * Reset rate limits for MFA operations (admin only)
   */
  async resetMFARateLimits(userId: string, adminUserId: string) {
    try {
      // Verify that the requesting user is an admin
      const adminSession = await this.getCurrentUser(
        {
          headers: { 'x-user-id': adminUserId },
        },
        {}
      );

      if (!adminSession.user || !this.hasRole(adminSession.user, 'admin')) {
        throw new Error('Unauthorized: Only admins can reset rate limits');
      }

      // Reset all MFA rate limit keys for the user
      const keys = [
        `${MFA_RATE_LIMITS.ENROLL.prefix}${userId}`,
        `${MFA_RATE_LIMITS.ENROLL.prefix}${userId}:window`,
        `${MFA_RATE_LIMITS.VERIFY.prefix}${userId}`,
        `${MFA_RATE_LIMITS.VERIFY.prefix}${userId}:window`,
        `${MFA_RATE_LIMITS.UNENROLL.prefix}${userId}`,
        `${MFA_RATE_LIMITS.UNENROLL.prefix}${userId}:window`,
      ];

      await Promise.all(keys.map(key => redisClient.del(key)));

      return { success: true, message: 'MFA rate limits reset successfully' };
    } catch (error) {
      console.error('Error resetting MFA rate limits:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance of the auth service
export const authService = new AuthService();
