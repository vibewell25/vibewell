module.exports = {
  roots: ['<rootDir>/__tests__', '<rootDir>/src/tests'],
  moduleNameMapper: {
    '^@opentelemetry/metrics$': '<rootDir>/__mocks__/opentelemetry-metrics.js',
    '^@opentelemetry/exporter-prometheus$': '<rootDir>/__mocks__/exporter-prometheus.js',
    '^vitest$': '<rootDir>/vitest-shim.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['js','jsx','ts','tsx','json','node','mjs'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(msw|@mswjs|@sentry/nextjs|@sentry/node)/)'],
  modulePathIgnorePatterns: ['<rootDir>/backups/'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 60000,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/tests/**/*.{js,jsx,ts,tsx}'
  ],
};
