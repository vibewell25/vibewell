import { test, expect } from '@playwright/test';

// Mock authentication to avoid actual login
test.beforeEach(async ({ page }) => {
  // Set cookies or localStorage to simulate authenticated state
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({

    id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
));
    
    // Set auth token

    localStorage.setItem('auth-token', 'mock-auth-token');
test.describe('Profile Settings Page', () => {
  test('should display user profile information', async ({ page }) => {
    // Navigate to profile settings page

    await page.goto('/profile/settings');
    
    // Wait for the profile data to load

    await page.waitForSelector('[data-testid="profile-settings-form"]');
    
    // Check if user information is displayed

    expect(await page.textContent('[data-testid="user-display-name"]')).toContain('Test User');

    expect(await page.textContent('[data-testid="user-email"]')).toContain('test@example.com');
test('should update profile settings successfully', async ({ page }) => {
    // Intercept API requests

    await page.route('**/api/user/profile', async (route) => {
      await route.fulfill({
        status: 200,

    contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Profile updated successfully',
),
// Navigate to profile settings page

    await page.goto('/profile/settings');
    
    // Wait for the profile form to load

    await page.waitForSelector('[data-testid="profile-settings-form"]');
    
    // Fill in the form with new values

    await page.fill('[data-testid="profile-name-input"]', 'Updated User Name');

    await page.fill('[data-testid="profile-bio-input"]', 'This is my updated bio.');
    
    // Submit the form

    await page.click('[data-testid="profile-save-button"]');
    
    // Check for success message

    await page.waitForSelector('[data-testid="success-message"]');

    expect(await page.textContent('[data-testid="success-message"]')).toContain('Profile updated successfully');
test('should change user preferences', async ({ page }) => {
    // Intercept API requests for user preferences

    await page.route('**/api/user-preferences', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,

    contentType: 'application/json',
          body: JSON.stringify({
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              sms: true,
}),
else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,

    contentType: 'application/json',
          body: JSON.stringify({
            theme: 'dark',
            language: 'fr',
            notifications: {
              email: false,
              push: true,
              sms: false,
}),
});
    
    // Navigate to preferences page

    await page.goto('/profile/preferences');
    
    // Wait for the preferences form to load

    await page.waitForSelector('[data-testid="preferences-form"]');
    
    // Change theme preference

    await page.click('[data-testid="theme-selector"] [data-value="dark"]');
    
    // Change language preference

    await page.selectOption('[data-testid="language-selector"]', 'fr');
    
    // Toggle notification preferences

    await page.click('[data-testid="notification-email-toggle"]'); // Turn off email notifications

    await page.click('[data-testid="notification-push-toggle"]'); // Turn on push notifications

    await page.click('[data-testid="notification-sms-toggle"]'); // Turn off SMS notifications
    
    // Save preferences

    await page.click('[data-testid="save-preferences-button"]');
    
    // Check for success message

    await page.waitForSelector('[data-testid="success-message"]');

    expect(await page.textContent('[data-testid="success-message"]')).toContain('Preferences updated');
    
    // Verify theme was applied to the UI

    expect(await page.getAttribute('html', 'data-theme')).toBe('dark');
test('should handle preference update errors gracefully', async ({ page }) => {
    // Intercept API requests for user preferences

    await page.route('**/api/user-preferences', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,

    contentType: 'application/json',
          body: JSON.stringify({
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              sms: true,
}),
else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,

    contentType: 'application/json',
          body: JSON.stringify({
            error: 'Failed to update preferences'
),
});
    
    // Navigate to preferences page

    await page.goto('/profile/preferences');
    
    // Wait for the preferences form to load

    await page.waitForSelector('[data-testid="preferences-form"]');
    
    // Change theme preference

    await page.click('[data-testid="theme-selector"] [data-value="dark"]');
    
    // Save preferences

    await page.click('[data-testid="save-preferences-button"]');
    
    // Check for error message

    await page.waitForSelector('[data-testid="error-message"]');

    expect(await page.textContent('[data-testid="error-message"]')).toContain('Failed to update preferences');
    
    // Verify theme was not applied to the UI

    expect(await page.getAttribute('html', 'data-theme')).toBe('light');
test('should log user out when clicking logout button', async ({ page }) => {
    // Navigate to profile settings page

    await page.goto('/profile/settings');
    
    // Wait for the profile page to load

    await page.waitForSelector('[data-testid="logout-button"]');
    
    // Setup navigation listener to detect redirect to login page
    const navigationPromise = page.waitForNavigation({ url: '**/login' });
    
    // Click logout button

    await page.click('[data-testid="logout-button"]');
    
    // Wait for redirect to login page
    await navigationPromise;
    
    // Verify user is redirected to login page
    expect(page.url()).toContain('/login');
    
    // Verify localStorage is cleared
    const isUserLoggedIn = await page.evaluate(() => {

    return localStorage.getItem('auth-token') !== null;
expect(isUserLoggedIn).toBe(false);
