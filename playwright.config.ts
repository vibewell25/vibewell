import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : 4,
  reporter: 'html',
  use: {
    baseURL: process.env['TEST_BASE_URL'] || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env['CI'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env['TEST_DATABASE_URL'] || 'postgresql://test:test@localhost:5432/vibewell_test',
      STRIPE_SECRET_KEY: process.env['TEST_STRIPE_SECRET_KEY'] || 'sk_test_dummy',
      STRIPE_WEBHOOK_SECRET: process.env['TEST_STRIPE_WEBHOOK_SECRET'] || 'whsec_dummy'
    }
  }
}); 