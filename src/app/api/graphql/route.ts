/**
 * GraphQL API endpoint for the Next.js App Router
 *
 * This implements a GraphQL API using Apollo Server integrated with Next.js.
 * It provides query and mutation capabilities for the VibeWell application.
 */

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/client';
import { logger } from '@/lib/logger';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';

// Create Apollo Server with our schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
});

// Helper function to get client IP
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

// Create the Next.js API Route handler with context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    try {
      // Create Supabase client

      // Get auth token from header if available
      const authHeader = req.headers.get('authorization');
      let userId = null;
      let userRole = 'anonymous';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data.user) {
          userId = data.user.id;
          userRole = data.user.user_metadata?.role || 'user';
        }
      }

      // Get IP for rate limiting
      const ip = getClientIp(req);

      // Return context for resolvers
      return {
        supabase,
        ip,
        userId,
        userRole,
      };
    } catch (error) {
      logger.error('Error creating GraphQL context', 'graphql', { error });
      return {
        ip: getClientIp(req),
      };
    }
  },
});

// Export the API route handlers
export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

// Set runtime options
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
