import { test, expect } from '@playwright/test';

    import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component showcase page
    await page.goto('/components');
test('Button components visual regression', async ({ page }) => {
    // Wait for all button variants to be visible

    await page.waitForSelector('[data-testid="button-showcase"]');
    
    // Take snapshot of all button variants

    await percySnapshot(page, 'Button Components - All Variants');
    
    // Test hover states

    await page.hover('button[data-variant="default"]');

    await percySnapshot(page, 'Button Components - Default Hover');
    

    await page.hover('button[data-variant="destructive"]');

    await percySnapshot(page, 'Button Components - Destructive Hover');
    
    // Test disabled state

    await page.waitForSelector('button[disabled]');

    await percySnapshot(page, 'Button Components - Disabled State');
test('Card components visual regression', async ({ page }) => {
    // Wait for all card variants to be visible

    await page.waitForSelector('[data-testid="card-showcase"]');
    
    // Take snapshot of all card variants

    await percySnapshot(page, 'Card Components - All Variants');
    
    // Test interactive states

    await page.hover('[data-testid="interactive-card"]');

    await percySnapshot(page, 'Card Components - Interactive Hover');
    
    // Test different content layouts

    await page.waitForSelector('[data-testid="card-with-media"]');

    await percySnapshot(page, 'Card Components - With Media');
    

    await page.waitForSelector('[data-testid="card-with-actions"]');

    await percySnapshot(page, 'Card Components - With Actions');
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
});

  test('Theme variations visual regression', async ({ page }) => {
    // Test light theme
    await page.evaluate(() => {

    document.documentElement.setAttribute('data-theme', 'light');
await percySnapshot(page, 'Components - Light Theme');

    // Test dark theme
    await page.evaluate(() => {

    document.documentElement.setAttribute('data-theme', 'dark');
await percySnapshot(page, 'Components - Dark Theme');
test('Loading states visual regression', async ({ page }) => {
    // Test loading states for buttons

    await page.waitForSelector('[data-testid="loading-button"]');

    await percySnapshot(page, 'Button Components - Loading State');

    // Test loading states for cards

    await page.waitForSelector('[data-testid="loading-card"]');

    await percySnapshot(page, 'Card Components - Loading State');
test('Error states visual regression', async ({ page }) => {
    // Test error states for form elements

    await page.waitForSelector('[data-testid="form-with-errors"]');

    await percySnapshot(page, 'Form Components - Error States');

    // Test error states for cards

    await page.waitForSelector('[data-testid="error-card"]');

    await percySnapshot(page, 'Card Components - Error State');
test('Animation states visual regression', async ({ page }) => {
    // Test entrance animations

    await page.waitForSelector('[data-testid="animated-component"]');

    await percySnapshot(page, 'Components - Initial State');

    // Trigger animation

    await page.click('[data-testid="animation-trigger"]');
    
    // Take snapshots at different animation keyframes

    await percySnapshot(page, 'Components - Animation Start');
    await page.waitForTimeout(500);

    await percySnapshot(page, 'Components - Animation Middle');
    await page.waitForTimeout(500);

    await percySnapshot(page, 'Components - Animation End');
test('Interactive elements visual regression', async ({ page }) => {
    // Test focus states

    await page.focus('button[data-testid="primary-button"]');

    await percySnapshot(page, 'Button Components - Focus State');

    // Test active states
    await page.keyboard.down('Space');

    await percySnapshot(page, 'Button Components - Active State');
    await page.keyboard.up('Space');
