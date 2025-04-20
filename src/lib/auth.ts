import { NextRequest } from 'next/server';
import { getStoredAuthToken } from '@/utils/auth-helpers';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Auth0Provider } from '@auth0/auth0-react';
import { initAuth0 } from '@auth0/nextjs-auth0';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from './prisma';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'provider' | 'admin';
  avatarUrl?: string;
}

/**
 * Gets the user from the request
 * @param request Next.js request
 * @returns User object or null if not authenticated
 */
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // In a real app, you would validate the JWT token
    // For demo purposes, we'll create a mock user
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Check cookies (for server components)
      const cookieToken = request.cookies.get('auth_token')?.value;
      if (cookieToken) {
        token = cookieToken;
      }
    }
    
    // Validate token (simplified for demo)
    if (token) {
      // Mock user - in a real app, you would decode and validate the JWT
      return {
        id: 'user123',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'user',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Server-side function to verify a token
 * @param token JWT token
 * @returns User data or null if invalid
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    // In a real app, you would validate the token against your auth service
    // For demo purposes, we'll just check if it exists
    if (token && token.startsWith('mock-token')) {
      return {
        id: 'user123',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'user',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Client-side function to get the current user
 * @returns User data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getStoredAuthToken();
    
    if (!token) {
      return null;
    }
    
    // In a real app, you would make an API call to validate the token
    // For demo purposes, we'll just check if it exists
    if (token.startsWith('mock-token')) {
      return {
        id: 'user123',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'user',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// Export auth object for API routes
export const auth = {
  getUserFromRequest,
  verifyToken,
  getCurrentUser,
  authOptions
};

export async function auth() {
  const session = await getServerSession(authOptions);
  return session;
}

export const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
  session: {
    rollingDuration: 60 * 60 * 24, // 24 hours
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days
  },
});

export const getAuthenticatedUser = async (req: any, res: any) => {
  try {
    const session = await getSession(req, res);
    if (!session?.user) return null;

    // Get or create user in our database
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.picture,
      },
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.picture,
      },
    });

    return {
      ...session.user,
      id: user.id,
      role: user.role,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
};

export const withPageAuthRequired = auth0.withPageAuthRequired;
export const withApiAuthRequired = auth0.withApiAuthRequired;
export const getAccessToken = auth0.getAccessToken; 