import { initAuth0 } from '@auth0/nextjs-auth0';

// Initialize Auth0
export {};

// Helper function to get user profile data with role information
export {};

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
