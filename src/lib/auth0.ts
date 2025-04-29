import { Auth0Client } from '@auth0/nextjs-auth0';
import type { Session, User } from '@auth0/nextjs-auth0';
import { authConfig } from '@/config/auth';

// Extend the default User type to include our custom properties
declare module '@auth0/nextjs-auth0' {
  interface User {
    roles?: string[];
    isAdmin?: boolean;
    isProvider?: boolean;
    isUser?: boolean;
  }
}

/**
 * Initialize the Auth0 client with our configuration
 * This instance will be used across the application for authentication
 */
export const auth0 = new Auth0Client(authConfig);

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
export function isAuthenticated(session: Session | null): session is Session & { user: User } {
  return !!session?.user;
}

export const { getSession, updateSession } = auth0;

// Type definitions for Auth0 user profile
export interface Auth0UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  isAdmin: boolean;
  isProvider: boolean;
  isUser: boolean;
}
