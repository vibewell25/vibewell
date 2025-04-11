module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.ts', '**/tests/smoke/**/*.test.ts', '**/tests/post-deploy/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupE2ETests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testTimeout: 30000
}; 