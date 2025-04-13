/**
 * Enhanced Jest configuration for the Vibewell project
 * This configuration extends the base Jest configuration with additional settings for testing
 */

const path = require('path');

module.exports = {
  // Set the test environment to use jsdom for DOM manipulation
  testEnvironment: 'jsdom',
  
  // Use enhanced setup file that includes all mocks and extensions
  setupFilesAfterEnv: ['<rootDir>/jest.enhanced-setup.js'],
  
  // Environment variables for testing
  globals: {
    'process.env.NODE_ENV': 'test',
  },
  
  // Enable test environment to simulate browser environment
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Enable verbose output for better debugging
  verbose: true,
  
  // Set test timeout (in milliseconds)
  testTimeout: 10000,
  
  // Display errors for deprecated features
  errorOnDeprecated: true,
  
  // Configure coverage collection
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/mocks/**',
    '!src/types/**',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/.next/**',
  ],
  
  // Pattern for test files
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js|jsx)',
    '**/?(*.)+(spec|test).+(ts|tsx|js|jsx)',
  ],
  
  // Transform files before tests run
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.test.js' }],
  },
  
  // Configure module name mapping for imports
  moduleNameMapper: {
    // Handle module aliases
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@/test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    
    // Handle CSS/SCSS imports
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Handle THREE.js and related loaders
    'three': '<rootDir>/__mocks__/three.js',
    'GLTFLoader': '<rootDir>/__mocks__/GLTFLoader.js',
    'DRACOLoader': '<rootDir>/__mocks__/DRACOLoader.js'
  },
  
  // Configure paths to ignore during tests
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/'
  ],
  
  // Configure file extensions to look for when resolving modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Configure coverage reporters
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  
  // Configure coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Define watch mode settings to improve dev experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Set cache directory for faster subsequent runs
  cacheDirectory: '.jest-cache',
  
  // Configure additional resolver options
  resolver: '<rootDir>/jest.resolver.js',
  
  // Skip execution of some time-consuming tests
  bail: false,
  
  // Configure notification settings
  notify: true,
  notifyMode: 'failure-change',
  
  // Configure test result processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Configure custom reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports/junit',
      outputName: 'jest-junit.xml'
    }]
  ],
  
  // Configure snapshot serializers
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  
  // Additional config for specific platforms/environments
  projects: [
    {
      displayName: 'test',
      testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js|jsx)',
        '**/?(*.)+(spec|test).+(ts|tsx|js|jsx)'
      ]
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}']
    }
  ],
  
  // Define global variables for tests
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }
  }
}; 