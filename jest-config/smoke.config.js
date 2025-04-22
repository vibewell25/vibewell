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
    '**/tests/smoke/**/*.ts',
    '**/tests/rate-limiting/**/*.ts'
  ],

  // Transforms and module mapping
  transform: transforms,
  moduleNameMapper: moduleMappers,

  // Test setup and configuration
  setupFilesAfterEnv: ['<rootDir>/jest-config/setup/node.setup.js'],
  testTimeout: 10000,

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|msw|@mswjs)/)',
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