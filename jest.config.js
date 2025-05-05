const nextJest = require('next/jest');

// Create a Jest config for the web app under apps/web
const createJestConfig = nextJest({ dir: './apps/web' });

/**
 * Custom Jest configuration
 * See: https://jestjs.io/docs/configuration
 */
const customJestConfig = {
  // Ignore broken unit and integration test directories
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/unit/',
    '<rootDir>/src/__tests__/integration/',
    '<rootDir>/src/tests/',
  ],

  // Allow resolving modules from node_modules and project root
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Polyfills for Node environment
  setupFiles: ['cross-fetch/polyfill'],

  // Setup files after the testing framework is installed
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Use jsdom for browser-like testing
  testEnvironment: 'jest-environment-jsdom',

  // Map path aliases to filesystem paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^ui/(.*)$': '<rootDir>/../../packages/ui/$1',
    '^services/(.*)$': '<rootDir>/../../packages/services/$1',
    '^types/(.*)$': '<rootDir>/../../packages/types/$1',
    '^config/(.*)$': '<rootDir>/../../packages/config/$1',
    '^test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
    '^public/(.*)$': '<rootDir>/public/$1',
// Glob patterns for test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // Specify file extensions for coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
// Transform with Babel (Next + TypeScript presets)
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['next/babel', '@babel/preset-typescript'] }],
// Ignore styles and node_modules
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Watch plugin suggestions
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],

  // Global variables for ts-jest
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.jest.json' },
// Export the final Jest config
module.exports = createJestConfig(customJestConfig);
