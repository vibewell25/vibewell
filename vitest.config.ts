import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { testAliases } from './tests/setup/test-aliases'; 

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    alias: {
      '@': './src',
      ...testAliases // Include our test aliases for mock modules
    },
    include: ['./tests/**/*.test.ts', './tests/**/*.test.tsx'],
    exclude: ['./tests/e2e/**', './tests/fixtures/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
      '@components': path.resolve(__dirname, 'apps/web/src/components'),
      '@hooks': path.resolve(__dirname, 'apps/web/src/hooks'),
      'ui': path.resolve(__dirname, 'packages/ui'),
      'services': path.resolve(__dirname, 'packages/services'),
      'types': path.resolve(__dirname, 'packages/types'),
      'config': path.resolve(__dirname, 'packages/config'),
      'test-utils': path.resolve(__dirname, 'src/test-utils'),
      ...testAliases // Include our test aliases for mock modules
    }
  }
});
