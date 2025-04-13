// Jest configuration file for testing
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Custom jest config
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.enhanced-setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle module CSS
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports
    '\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle Three.js and related loaders
    '^three$': '<rootDir>/__mocks__/three.js',
    '^three/examples/jsm/loaders/GLTFLoader': '<rootDir>/__mocks__/GLTFLoader.js',
    '^three/examples/jsm/loaders/DRACOLoader': '<rootDir>/__mocks__/DRACOLoader.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!three)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// Export the merged config
module.exports = createJestConfig(customJestConfig); 