const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './apps/web',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/../node_modules'],
  // Polyfill fetch for Node environment
  setupFiles: ['cross-fetch/polyfill'],

  // Load our global test utilities and polyfills
  setupFilesAfterEnv: ['<rootDir>/apps/web/src/setupTests.ts'],

  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^ui/(.*)$': '<rootDir>/packages/ui/$1',
    '^services/(.*)$': '<rootDir>/packages/services/$1',
    '^types/(.*)$': '<rootDir>/packages/types/$1',
    '^config/(.*)$': '<rootDir>/packages/config/$1',
    '^test-utils/(.*)$': '<rootDir>/apps/web/src/test-utils/$1',
    '^public/(.*)$': '<rootDir>/public/$1',
  },
  testMatch: [
    '<rootDir>/apps/web/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/apps/web/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'apps/web/src/**/*.{js,jsx,ts,tsx}',
    '!apps/web/src/**/*.d.ts',
    '!apps/web/src/types/**/*',
    '!apps/web/src/**/*.stories.{js,jsx,ts,tsx}',
    '!apps/web/src/pages/_app.tsx',
    '!apps/web/src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    // Use babel-jest with TypeScript preset for JS/TS files
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['next/babel', '@babel/preset-typescript'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
