import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test('homepage visual test', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'Homepage');
  });

  test('beauty-wellness page visual test', async ({ page }) => {
    await page.goto('/beauty-wellness');
    await percySnapshot(page, 'Beauty Wellness Page');
  });

  // Add more visual tests for critical pages
  test('responsive design tests', async ({ page }) => {
    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Mobile');

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Tablet');

    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Desktop');
  });
});
