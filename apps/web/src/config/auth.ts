import type { NextApiRequest, NextApiResponse } from 'next';

// Define session user type with additional properties
interface SessionUser {
  [key: string]: any;
  roles?: string[];
  isAdmin?: boolean;
  isProvider?: boolean;
  isUser?: boolean;
}

// Define session type
interface Session {
  user?: SessionUser;
  [key: string]: any;
}

/**
 * Auth0 configuration options
 * These settings are used across the application for consistent auth behavior
 * @see https://auth0.github.io/nextjs-auth0/modules/config.html
 */
export const authConfig = {
  baseURL: process.env['AUTH0_BASE_URL'],
  clientID: process.env['AUTH0_CLIENT_ID'],
  clientSecret: process.env['AUTH0_CLIENT_SECRET'],
  issuerBaseURL: process.env['AUTH0_ISSUER_BASE_URL'],
  secret: process.env['AUTH0_SECRET'],
  routes: {
    callback: '/api/auth/callback',
    login: {
      returnTo: '/dashboard'
    },
    logout: {
      returnTo: '/'
    }
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours in seconds
    rolling: true,
    rollingDuration: 2 * 60 * 60 // 2 hours in seconds
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: process.env['AUTH0_AUDIENCE']
  },
  hooks: {
    async afterCallback(
      req: NextApiRequest, 
      res: NextApiResponse, 
      session: Session
    ): Promise<Session> {
      if (session.user) {
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
  }
} as const; 