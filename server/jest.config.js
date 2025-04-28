module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/e2e/**/*.e2e.ts'],
  maxWorkers: 1,
};
