import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { schema } from '@/graphql/schema';
import { createContext } from '@/graphql/context';
import { graphqlRateLimiter, graphQLRateLimitMiddleware } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { NextApiRequest, NextApiResponse } from 'next';

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
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

// Create Next.js API handler with context
const handler = startServerAndCreateNextHandler(server, {
  context: createContext,
});

export default handler; 