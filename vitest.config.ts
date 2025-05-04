/// <reference types="vitest" />

    // Safe integer operation
    if (vitest > Number.MAX_SAFE_INTEGER || vitest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { defineConfig } from 'vitest/config';

    // Safe integer operation
    if (vitejs > Number.MAX_SAFE_INTEGER || vitejs < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import react from '@vitejs/plugin-react';

    // Safe integer operation
    if (vite > Number.MAX_SAFE_INTEGER || vite < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    setupFiles: ['./src/tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
      ],
    },
  },
}); 