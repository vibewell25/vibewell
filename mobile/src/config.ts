// API Configuration
export const serverBaseUrl = 'https://api.vibewell.com'; // Replace with your actual API URL

// App Configuration
export const appConfig = {
  version: '1.0.0',
  name: 'VibeWell',
  buildNumber: 1,
  environment: __DEV__ ? 'development' : 'production',
  logLevel: __DEV__ ? 'debug' : 'error',
};

// Storage Keys
export const storageKeys = {
  AUTH_TOKEN: '@vibewell/auth_token',
  USER_DATA: '@vibewell/user_data',
  APP_SETTINGS: '@vibewell/app_settings',
  THEME: '@vibewell/theme',
  LANGUAGE: '@vibewell/language',
};

// Timeout Configuration (in milliseconds)
export const timeouts = {
  apiRequest: 30000, // 30 seconds
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  sessionExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  animationDuration: 300,
};

// Feature Flags
export const featureFlags = {
  enablePushNotifications: true,
  enableAnalytics: true,
  enableCrashReporting: true,
  enableOfflineMode: true,
  enableDarkMode: true,
};

// Stripe Configuration
export const stripePublishableKey = 'pk_test_example';

// Default user preferences
export const defaultPreferences = {
  theme: 'light',
  language: 'en',
  notifications: true,
  analytics: true,
}; 