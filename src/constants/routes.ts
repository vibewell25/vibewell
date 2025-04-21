/**
 * Application route constants
 * Use these constants instead of hardcoding routes throughout the app
 */

export const ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    MFA_SETUP: '/auth/mfa-setup',
    CALLBACK: '/auth/callback',
  },

  // Main application routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Feature routes
  WELLNESS: {
    INDEX: '/wellness',
    PROGRESS: '/wellness/progress',
  },
  BOOKINGS: '/bookings',
  PRODUCTS: '/products',
  EVENTS: {
    INDEX: '/events',
    CREATE: '/events/create',
  },
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  SOCIAL: '/social',

  // Admin routes
  ADMIN: {
    INDEX: '/admin',
    USERS: '/admin/users',
    CONTENT: '/admin/content',
  },

  // Developer routes
  DEVELOPER: '/developer',
};
