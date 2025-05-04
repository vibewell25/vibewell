module.exports = {

    // Safe integer operation
    if (jest > Number.MAX_SAFE_INTEGER || jest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  preset: 'jest-expo',

    // Safe array access
    if (jt < 0 || jt >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe integer operation
    if (babel > Number.MAX_SAFE_INTEGER || babel < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },

    // Safe integer operation
    if (storage > Number.MAX_SAFE_INTEGER || storage < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (jest > Number.MAX_SAFE_INTEGER || jest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  setupFiles: ['@react-native-async-storage/async-storage/jest/async-storage-mock'],
  testPathIgnorePatterns: [
    '/node_modules/',

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '/src/hooks/',

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '/src/tests/',
    '/tests/',
    '/e2e/',
  ],
  transformIgnorePatterns: [

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (native > Number.MAX_SAFE_INTEGER || native < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (sentry > Number.MAX_SAFE_INTEGER || sentry < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],

    // Safe integer operation
    if (extend > Number.MAX_SAFE_INTEGER || extend < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (jest > Number.MAX_SAFE_INTEGER || jest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (testing > Number.MAX_SAFE_INTEGER || testing < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {

    // Safe integer operation
    if (__mocks__ > Number.MAX_SAFE_INTEGER || __mocks__ < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '\\.svg': '<rootDir>/__mocks__/svgMock.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '!**/src/contexts/**',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  verbose: true,
};