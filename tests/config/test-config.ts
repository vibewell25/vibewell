export const TEST_CONFIG = {
  // API endpoints
  API_BASE_URL: 'http://localhost:3000/api',
  
  // Authentication
  TEST_USER_EMAIL: 'test@example.com',
  TEST_USER_PASSWORD: 'test123',
  
  // Database
  TEST_DATABASE_URL: 'postgresql://test:test@localhost:5432/vibewell_test',
  
  // External services
  MOCK_PAYMENT_KEY: 'test_payment_key',
  MOCK_STORAGE_KEY: 'test_storage_key',
  
  // Feature flags
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  
  // Test timeouts (in milliseconds)
  DEFAULT_TIMEOUT: 5000,
  NETWORK_TIMEOUT: 10000,
  ANIMATION_TIMEOUT: 1000,
  
  // Test data limits
  MAX_TEST_USERS: 10,
  MAX_TEST_SERVICES: 5,
  MAX_TEST_BOOKINGS: 20,
  
  // Paths

    UPLOAD_PATH: '/tmp/test-uploads',

    CACHE_PATH: '/tmp/test-cache',
  
  // Test modes
  STRICT_MODE: true,
  DEBUG_MODE: false,
  
  // Rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
export const TEST_ENDPOINTS = {
  AUTH: {

    LOGIN: '/auth/login',

    REGISTER: '/auth/register',

    LOGOUT: '/auth/logout',

    REFRESH: '/auth/refresh'
SERVICES: {
    BASE: '/services',

    CATEGORIES: '/services/categories',

    AVAILABILITY: '/services/availability'
BOOKINGS: {
    BASE: '/bookings',

    UPCOMING: '/bookings/upcoming',

    HISTORY: '/bookings/history'
USERS: {
    BASE: '/users',

    PROFILE: '/users/profile',

    PREFERENCES: '/users/preferences'
HEALTH: '/health'
