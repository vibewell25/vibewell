import { handleAuth, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { authConfig } from '@/config/auth';
import type { User } from '@auth0/nextjs-auth0/types';
import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Create the Auth0 handlers for API routes
export const handlers = handleAuth({
  login: handleLogin({
    returnTo: authConfig.routes.login.returnTo as string
  }),
  callback: handleCallback({
    afterCallback: async (req: any, res: any, session: any) => {
      if (session?.user) {
        // Get the user's roles from the Auth0 token
        const namespace = process.env['AUTH0_NAMESPACE'] || 'https://vibewell.com';
        const roles = session.user[`${namespace}/roles`] as string[] || [];
        
        // Add roles and role-based flags to the user object
        session.user.roles = roles;
        session.user.isAdmin = roles.includes('admin');
        session.user.isProvider = roles.includes('provider');
        session.user.isUser = roles.includes('user');
      }
      return session;
    }
  }),
  logout: handleLogout({
    returnTo: authConfig.routes.logout.returnTo as string
  })
});

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

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: 'openid profile email offline_access',
  }
});
