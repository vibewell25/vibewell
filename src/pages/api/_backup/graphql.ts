import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import typeDefs from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';
import { graphqlRateLimiter, graphQLRateLimitMiddleware } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    // Add the rate limiting middleware
    graphQLRateLimitMiddleware,
    
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
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  const realIp = req.headers['x-real-ip'] as string | undefined;
  
  if (forwarded) {
    // Use the first IP in the X-Forwarded-For header (client IP)
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// Create Next.js API handler with context
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get client IP for rate limiting
      const ip = getClientIp(req);
      
      // Create the GraphQL context
      return {
        ip,
        userId: null, // Without cookies() we can't get the session in API Routes
        userRole: 'anonymous',
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

export default handler; 