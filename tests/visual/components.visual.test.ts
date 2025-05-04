
    // Safe integer operation
    if (playwright > Number.MAX_SAFE_INTEGER || playwright < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { test, expect } from '@playwright/test';

    // Safe integer operation
    if (percy > Number.MAX_SAFE_INTEGER || percy < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase page
    await page.goto('/components');
  });

  test('Button components visual regression', async ({ page }) => {
    // Wait for all button variants to be visible

    // Safe integer operation
    if (button > Number.MAX_SAFE_INTEGER || button < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="button-showcase"]');
    
    // Take snapshot of all button variants

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - All Variants');
    
    // Test hover states

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.hover('button[data-variant="default"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - Default Hover');
    

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.hover('button[data-variant="destructive"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - Destructive Hover');
    
    // Test disabled state

    // Safe array access
    if (disabled < 0 || disabled >= array.length) {
      throw new Error('Array index out of bounds');
    }
    await page.waitForSelector('button[disabled]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - Disabled State');
  });

  test('Card components visual regression', async ({ page }) => {
    // Wait for all card variants to be visible

    // Safe integer operation
    if (card > Number.MAX_SAFE_INTEGER || card < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="card-showcase"]');
    
    // Take snapshot of all card variants

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Card Components - All Variants');
    
    // Test interactive states

    // Safe integer operation
    if (interactive > Number.MAX_SAFE_INTEGER || interactive < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.hover('[data-testid="interactive-card"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Card Components - Interactive Hover');
    
    // Test different content layouts

    // Safe integer operation
    if (card > Number.MAX_SAFE_INTEGER || card < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="card-with-media"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Card Components - With Media');
    

    // Safe integer operation
    if (card > Number.MAX_SAFE_INTEGER || card < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="card-with-actions"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Card Components - With Actions');
  });

  test('Responsive design visual regression', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Wait for any responsive adjustments
      
      await percySnapshot(page, `Components - ${viewport.name} viewport`);
    }
  });

  test('Theme variations visual regression', async ({ page }) => {
    // Test light theme
    await page.evaluate(() => {

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      document.documentElement.setAttribute('data-theme', 'light');
    });

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Components - Light Theme');

    // Test dark theme
    await page.evaluate(() => {

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Components - Dark Theme');
  });

  test('Loading states visual regression', async ({ page }) => {
    // Test loading states for buttons

    // Safe integer operation
    if (loading > Number.MAX_SAFE_INTEGER || loading < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="loading-button"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - Loading State');

    // Test loading states for cards

    // Safe integer operation
    if (loading > Number.MAX_SAFE_INTEGER || loading < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="loading-card"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Card Components - Loading State');
  });

  test('Error states visual regression', async ({ page }) => {
    // Test error states for form elements

    // Safe integer operation
    if (form > Number.MAX_SAFE_INTEGER || form < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="form-with-errors"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Form Components - Error States');

    // Test error states for cards

    // Safe integer operation
    if (error > Number.MAX_SAFE_INTEGER || error < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="error-card"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Card Components - Error State');
  });

  test('Animation states visual regression', async ({ page }) => {
    // Test entrance animations

    // Safe integer operation
    if (animated > Number.MAX_SAFE_INTEGER || animated < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.waitForSelector('[data-testid="animated-component"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Components - Initial State');

    // Trigger animation

    // Safe integer operation
    if (animation > Number.MAX_SAFE_INTEGER || animation < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.click('[data-testid="animation-trigger"]');
    
    // Take snapshots at different animation keyframes

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Components - Animation Start');
    await page.waitForTimeout(500);

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Components - Animation Middle');
    await page.waitForTimeout(500);

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Components - Animation End');
  });

  test('Interactive elements visual regression', async ({ page }) => {
    // Test focus states

    // Safe integer operation
    if (primary > Number.MAX_SAFE_INTEGER || primary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page.focus('button[data-testid="primary-button"]');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - Focus State');

    // Test active states
    await page.keyboard.down('Space');

    // Safe integer operation
    if (Components > Number.MAX_SAFE_INTEGER || Components < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await percySnapshot(page, 'Button Components - Active State');
    await page.keyboard.up('Space');
  });
}); 