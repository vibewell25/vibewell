module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Map Three.js imports to mock implementations
    'three/examples/jsm/loaders/GLTFLoader': '<rootDir>/src/__mocks__/GLTFLoader.js',
    'three/addons/loaders/GLTFLoader.js': '<rootDir>/src/__mocks__/GLTFLoader.js',
    'three/examples/jsm/loaders/DRACOLoader': '<rootDir>/src/__mocks__/DRACOLoader.js',
    'three/addons/loaders/DRACOLoader.js': '<rootDir>/src/__mocks__/DRACOLoader.js'
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|jose|msw|@mswjs|three|@react-three)/)'
  ],
  // Add a longer timeout for tests
  testTimeout: 30000
}; 