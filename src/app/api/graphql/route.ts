/**
 * GraphQL API endpoint with integrated rate limiting
 * 
 * This implements a GraphQL API using Apollo Server integrated with Next.js App Router.
 * It includes comprehensive rate limiting:
 * - Operation-level rate limiting (queries, mutations, subscriptions)
 * - Field-level rate limiting for expensive operations
 * - Query complexity analysis to prevent abuse
 */

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import typeDefs from '@/lib/graphql/schema';
import { createGraphQLRateLimitMiddleware, GraphQLContext } from '@/lib/rate-limiter';
import { resolvers } from '@/lib/graphql/resolvers';

// Create Apollo Server with our schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  plugins: [
    // Add the rate limiting plugin
    createGraphQLRateLimitMiddleware(),
    
    // Error logging plugin
    {
      async requestDidStart() {
        return {
          async didEncounterErrors({ errors }) {
            if (errors) {
              errors.forEach(error => {
                // Don't log rate limiting errors at error level
                if (error.extensions?.code === 'RATE_LIMITED') {
                  logger.warn('GraphQL rate limit error', 'graphql', { 
                    message: error.message,
                    path: error.path?.join('.'),
                    extensions: error.extensions
                  });
                } else {
                  logger.error('GraphQL error', 'graphql', { 
                    message: error.message,
                    path: error.path?.join('.'),
                    locations: error.locations,
                    stack: error.stack
                  });
                }
              });
            }
          }
        };
      }
    }
  ]
});

// IP address extraction utility
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    // Use the first IP in the X-Forwarded-For header (client IP)
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// Create the Next.js API Route handler
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    try {
      // Get the Supabase client
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => cookies().get(name)?.value,
            set: () => {}, // We don't need to set cookies from the API
            remove: () => {}, // We don't need to remove cookies from the API
          },
        }
      );
      
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get client IP for rate limiting
      const ip = getClientIp(req);
      
      // Create the GraphQL context
      const context: GraphQLContext = {
        ip,
        userId: session?.user?.id,
        userRole: session?.user?.user_metadata?.role || 'anonymous',
      };
      
      // Add the Supabase client to the context
      return {
        ...context,
        supabase,
      };
    } catch (error) {
      logger.error('Error creating GraphQL context', 'graphql', { error });
      
      // Return minimal context with IP for rate limiting
      return {
        ip: getClientIp(req),
      };
    }
  },
});

// Rate-limited API Route handlers
export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

// CORS headers for the GraphQL API
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 