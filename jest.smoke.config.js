module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/smoke/**/*.ts', '**/tests/rate-limiting/**/*.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['./jest.node.setup.js'],
  testTimeout: 10000,
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|jose|msw|@mswjs)/)'
  ]
}; 