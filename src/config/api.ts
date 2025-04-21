import { ApiVersion } from '@/types/api';

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  version: ApiVersion.V1,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
  },
  rateLimits: {
    defaultRequestsPerMinute: 60,
    authRequestsPerMinute: 5,
  },
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      verify: '/auth/verify',
    },
    users: {
      profile: '/users/profile',
      settings: '/users/settings',
      preferences: '/users/preferences',
    },
    bookings: {
      list: '/bookings',
      create: '/bookings/create',
      update: '/bookings/:id',
      cancel: '/bookings/:id/cancel',
    },
    services: {
      list: '/services',
      categories: '/services/categories',
      search: '/services/search',
      details: '/services/:id',
    },
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
  },
};
