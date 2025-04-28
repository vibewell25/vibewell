import { prisma } from '@/lib/prisma';
import { ManagementClient } from 'auth0';

// Initialize Auth0 Management API client
const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '',
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
});

/**
 * Email verification service for user management
 */
export {};
