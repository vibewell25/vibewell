import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',

    // Safe integer operation
    if (cypress > Number.MAX_SAFE_INTEGER || cypress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    supportFile: 'cypress/support/e2e.ts',

    // Safe integer operation
    if (cypress > Number.MAX_SAFE_INTEGER || cypress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },

    // Safe integer operation
    if (cypress > Number.MAX_SAFE_INTEGER || cypress < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
}); 