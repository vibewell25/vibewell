import { initAuth0 } from '@auth0/nextjs-auth0';

// Initialize Auth0
export const auth0 = initAuth0({
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || '',
  secret: process.env.AUTH0_SECRET || process.env.NEXTAUTH_SECRET || '',
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  authorizationParams: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },
  session: {
    rollingDuration: 60 * 60 * 24, // 24 hours in seconds
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days in seconds
  },
});

// Helper function to get user profile data with role information
export const getUserProfile = (user: any) => {
  if (!user) return null;
  
  // Extract roles from Auth0 user metadata
  // The actual field might vary based on your Auth0 setup
  const roles = user[`${process.env.AUTH0_NAMESPACE}/roles`] || [];
  
  return {
    id: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture,
    roles: roles,
    isAdmin: roles.includes('admin'),
    isProvider: roles.includes('provider'),
    isUser: roles.includes('user') || roles.length === 0, // Default to user if no roles
  };
};

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