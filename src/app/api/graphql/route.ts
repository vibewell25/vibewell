/**
 * GraphQL API endpoint for the Next?.js App Router
 *
 * This implements a GraphQL API using Apollo Server integrated with Next?.js.
 * It provides query and mutation capabilities for the VibeWell application.
 */


import { createYoga } from 'graphql-yoga';

import { schema } from '@/lib/graphql/schema';

import { createContext } from '@/lib/graphql/context';

import { NextRequest } from 'next/server';

const { handleRequest } = createYoga({
  schema,
  context: createContext,

  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
});

// Helper function to get client IP
function getClientIp(req: NextRequest): string {

  const forwarded = req?.headers.get('x-forwarded-for');

  const realIp = req?.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded?.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

// Export the API route handlers
export { handleRequest as GET, handleRequest as POST };

// Set runtime options
export {};
export {};
