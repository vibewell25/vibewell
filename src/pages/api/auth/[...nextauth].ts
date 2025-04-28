import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { User } from '@prisma/client';

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user) {
            logger.warn(`User not found: ${credentials.email}`);
            throw new Error('No user found with this email');
          }

          // If the user registered using a social provider
          if (!user.password) {
            logger.warn(
              `User ${credentials.email} registered via social provider, cannot use password login`,
            );
            throw new Error('This account was registered through a social provider');
          }

          const isValid = await verifyPassword(credentials.password, user.password);

          if (!isValid) {
            logger.warn(`Invalid password for user: ${credentials.email}`);
            throw new Error('Invalid password');
          }

          logger.info(`User authenticated: ${credentials.email}`);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          logger.error('Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Include user id in token when first signed in
      if (user) {
        token.userId = user.id;
        token.role = (user as unknown as User).role || 'USER';
      }
      // Add provider information to the token
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.provider = token.provider as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      logger.info(
        `User signed in: ${user.email}, Provider: ${account?.provider}, New User: ${isNewUser}`,
      );

      // Track analytics for new user registration
      if (isNewUser) {
        try {
          await prisma.analytics.create({
            data: {
              event: 'SIGNUP',
              provider: account?.provider || 'unknown',
              userId: user.id,
              metadata: {
                email: user.email,
                name: user.name,
              },
            },
          });
        } catch (error) {
          logger.error('Failed to track signup analytics:', error);
        }
      }
    },
    async signOut({ token }) {
      logger.info(`User signed out: ${token.email}`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
