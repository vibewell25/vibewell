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
    '/node_modules/',
    '/.next/',
    '/temp_backup/',
  ],

  // Allow resolving modules from node_modules and project root
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Polyfills for Node environment
  setupFiles: ['cross-fetch/polyfill'],

  // Setup files after the testing framework is installed
  setupFilesAfterEnv: [
    '<rootDir>/setupTests.ts',
    '<rootDir>/jest.msw.setup.js'
  ],

  // Use jsdom for browser-like testing
  testEnvironment: 'jest-environment-jsdom',

  // Map path aliases to filesystem paths and handle file imports
  moduleNameMapper: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^ui/(.*)$': '<rootDir>/packages/ui/$1',
    '^services/(.*)$': '<rootDir>/packages/services/$1',
    '^types/(.*)$': '<rootDir>/packages/types/$1',
    '^config/(.*)$': '<rootDir>/packages/config/$1',
    '^test-utils/(.*)$': '<rootDir>/apps/web/src/test-utils/$1',
    '^public/(.*)$': '<rootDir>/apps/web/public/$1',
    // File imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Glob patterns for test files
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],

  // Specify file extensions for coverage
  collectCoverageFrom: [
    'apps/web/src/**/*.{js,jsx,ts,tsx}',
    '!apps/web/src/**/*.d.ts',
    '!apps/web/src/types/**/*',
    '!apps/web/src/**/*.stories.{js,jsx,ts,tsx}',
    '!apps/web/src/pages/_app.tsx',
    '!apps/web/src/pages/_document.tsx',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  
  // Transform with Babel (Next + TypeScript presets)
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['next/babel', '@babel/preset-typescript'] }],
  },
  
  // Ignore styles and node_modules
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Watch plugin suggestions
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],

  // Global variables for ts-jest
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.jest.json' },
  },
  
  // Prevent duplicate module names in Haste map
  modulePathIgnorePatterns: ['<rootDir>/temp_backup/'],
};

// Export the final Jest config
module.exports = createJestConfig(customJestConfig);
