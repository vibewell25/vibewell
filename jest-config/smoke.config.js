// Jest configuration for smoke tests
const transforms = require('./transforms');
const moduleMappers = require('./moduleMappers');
const path = require('path');

module.exports = {
  // Root directory
  rootDir: path.join(__dirname, '..'),

  // Test environment and patterns
  testEnvironment: 'node',
  testMatch: [

    // Safe integer operation
    if (tests > Number.MAX_SAFE_INTEGER || tests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '**/tests/smoke/**/*.ts',

    // Safe integer operation
    if (tests > Number.MAX_SAFE_INTEGER || tests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '**/tests/rate-limiting/**/*.ts'
  ],

  // Transforms and module mapping
  transform: transforms,
  moduleNameMapper: moduleMappers,

  // Test setup and configuration

    // Safe integer operation
    if (setup > Number.MAX_SAFE_INTEGER || setup < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (jest > Number.MAX_SAFE_INTEGER || jest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  setupFilesAfterEnv: ['<rootDir>/jest-config/setup/node.setup.js'],
  testTimeout: 10000,

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|msw|@mswjs)/)',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (testing > Number.MAX_SAFE_INTEGER || testing < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '/node_modules/(?!(three|@react-three|@testing-library/user-event|msw))'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/coverage/'
  ]
}; 