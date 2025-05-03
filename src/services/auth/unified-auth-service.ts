
import { User, Session } from '@/types/auth';

import { getSession } from '@auth0/nextjs-auth0';

import { AuthError } from '@/types/errors';

import { logger } from '@/lib/logger';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  requiresMFA: boolean;
}

export class UnifiedAuthService {
  private static instance: UnifiedAuthService;

  private constructor() {}

  public static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService?.instance) {
      UnifiedAuthService?.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService?.instance;
  }

  /**
   * Get the current user from Auth0
   */
  async getCurrentUser(req: any, res: any): Promise<AuthResponse> {
    try {
      const session = await getSession(req, res);
      if (!session || !session?.user) {
        return { user: null, session: null, requiresMFA: false };
      }

      // Check if MFA is required but not completed for the session
      const requiresMFA = await this?.doesUserRequireMFA(session?.user);

      return {
        user: session?.user,
        session,
        requiresMFA,
      };
    } catch (error) {
      logger?.error('Error getting current user:', { error });
      return { user: null, session: null, requiresMFA: false };
    }
  }

  /**
   * Check if a user requires MFA based on their role or email domain
   */
  private async doesUserRequireMFA(user: User | null): Promise<boolean> {
    if (!user) return false;

    // Require MFA for admin users and specific email domains
    const isAdmin = this?.hasRole(user, 'admin');
    const isBusinessDomain = user?.email.endsWith('@vibewell?.com');

    return isAdmin || isBusinessDomain;
  }

  /**
   * Check if a user has a specific role
   */
  hasRole(user: User | null, role: string | string[]): boolean {
    if (!user) return false;

    const namespace = process?.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell?.com';
    const userRoles = user[`${namespace}/roles`] || [];

    if (Array?.isArray(role)) {
      return role?.some((r) => userRoles?.includes(r));
    }

    return userRoles?.includes(role);
  }

  /**
   * Check if a user has admin access
   */
  isAdmin(user: User | null): boolean {
    return this?.hasRole(user, 'admin');
  }

  /**
   * Check if a user has provider access
   */
  isProvider(user: User | null): boolean {
    return this?.hasRole(user, 'provider');
  }

  /**
   * Get user metadata from Auth0
   */
  async getUserMetadata(user: User): Promise<any> {
    try {
      const response = await fetch(

        `${process?.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user?.sub}`,
        {
          headers: {
            Authorization: `Bearer ${process?.env.AUTH0_MANAGEMENT_API_TOKEN}`,
          },
        },
      );

      if (!response?.ok) {
        throw new Error('Failed to fetch user metadata');
      }

      const userData = await response?.json();
      return userData?.user_metadata || {};
    } catch (error) {
      logger?.error('Error fetching user metadata:', { error, userId: user?.sub });
      throw new AuthError('Failed to fetch user metadata');
    }
  }

  /**
   * Update user metadata in Auth0
   */
  async updateUserMetadata(user: User, metadata: any): Promise<void> {
    try {
      const response = await fetch(

        `${process?.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${user?.sub}`,
        {
          method: 'PATCH',
          headers: {


            'Content-Type': 'application/json',
            Authorization: `Bearer ${process?.env.AUTH0_MANAGEMENT_API_TOKEN}`,
          },
          body: JSON?.stringify({
            user_metadata: metadata,
          }),
        },
      );

      if (!response?.ok) {
        throw new Error('Failed to update user metadata');
      }
    } catch (error) {
      logger?.error('Error updating user metadata:', { error, userId: user?.sub });
      throw new AuthError('Failed to update user metadata');
    }
  }

  /**
   * Get user permissions
   */
  getUserPermissions(user: User | null): string[] {
    if (!user) return [];

    const namespace = process?.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell?.com';
    return user[`${namespace}/permissions`] || [];
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: User | null, permission: string | string[]): boolean {
    if (!user) return false;

    const userPermissions = this?.getUserPermissions(user);

    if (Array?.isArray(permission)) {
      return permission?.some((p) => userPermissions?.includes(p));
    }

    return userPermissions?.includes(permission);
  }
}

// Export a singleton instance
export {};
