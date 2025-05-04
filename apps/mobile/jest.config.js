module.exports = {
  preset: 'jest-expo',
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  setupFiles: ['@react-native-async-storage/async-storage/jest/async-storage-mock'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/hooks/',
    '/src/tests/',
    '/tests/',
    '/e2e/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.js'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/src/contexts/**'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  verbose: true
};