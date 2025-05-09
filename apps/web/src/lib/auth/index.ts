import { auth } from '@auth0/nextjs-auth0';
import type { User } from '@auth0/nextjs-auth0/types';
import { authConfig } from '@/config/auth';

// Extend the default User type to include custom properties
declare module '@auth0/nextjs-auth0/types' {
  interface User {
    roles?: string[];
    isAdmin?: boolean;
    isProvider?: boolean;
    isUser?: boolean;
  }
}

/**
 * Helper function to check if a user has a specific role
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
  if (!user?.roles) return false;
  return user.roles.includes(role);
}

/**
 * Helper function to check if a session is valid and has a user
 */
export function isAuthenticated(session: { user?: User } | null): boolean {
  return !!session?.user;
}

/**
 * Helper function to check if a user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, 'admin');
}

/**
 * Helper function to check if a user is a provider
 */
export function isProvider(user: User | null | undefined): boolean {
  return hasRole(user, 'provider');
}

// Export everything as a unified auth service
export const authService = {
  getSession: auth,
  auth,
  hasRole,
  isAuthenticated,
  isAdmin,
  isProvider,
};

export { auth };
export default authService; 