import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
    
    // Login before testing the booking flow
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page.locator('text=My Dashboard')).toBeVisible();
test('Complete end-to-end booking flow', async ({ page }) => {
    // Step 1: Navigate to events page
    await page.click('text=Events');
    await expect(page).toHaveURL(/.*\/events/);
    
    // Step 2: Search for an event
    await page.fill('input[placeholder="Search events..."]', 'Wellness Workshop');
    await page.press('input[placeholder="Search events..."]', 'Enter');
    
    // Verify search results
    await expect(page.locator('text=Wellness Workshop')).toBeVisible();
    
    // Step 3: Click on an event to view details
    await page.click('text=Wellness Workshop');
    
    // Verify event details page loaded

    await expect(page.locator('h1:has-text("Wellness Workshop")')).toBeVisible();

    await expect(page.locator('button:has-text("Book Now")')).toBeVisible();
    
    // Step 4: Start booking process

    await page.click('button:has-text("Book Now")');
    
    // Verify booking modal or page opened

    await expect(page.locator('h2:has-text("Book Your Spot")')).toBeVisible();
    
    // Step 5: Fill in booking details
    await page.selectOption('select[name="participants"]', '2');
    

    // If there are date/time options, select them
    const hasDateSelection = await page.locator('select[name="date"]').count() > 0;
    if (hasDateSelection) {
      await page.selectOption('select[name="date"]', { index: 1 });
      await page.selectOption('select[name="time"]', { index: 1 });
// Fill in any additional required information
    await page.fill('textarea[name="specialRequests"]', 'No special requirements');
    
    // Step 6: Proceed to checkout

    await page.click('button:has-text("Continue to Payment")');
    
    // Verify payment page loaded

    await expect(page.locator('h2:has-text("Payment Details")')).toBeVisible();
    
    // Step 7: Fill in payment details
    // Use test card details for Stripe
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardExpiry"]', '12/28');
    await page.fill('input[name="cardCvc"]', '123');
    await page.fill('input[name="billingName"]', 'Test User');
    
    // Step 8: Submit payment

    await page.click('button:has-text("Complete Booking")');
    
    // Step 9: Verify booking confirmation

    await expect(page.locator('h1:has-text("Booking Confirmed")')).toBeVisible();
    await expect(page.locator('text=Booking Reference')).toBeVisible();
    
    // Verify booking details are displayed correctly
    await expect(page.locator('text=Wellness Workshop')).toBeVisible();
    await expect(page.locator('text=2 Participants')).toBeVisible();
    
    // Step 10: Navigate to bookings page to verify booking was saved
    await page.click('text=My Bookings');
    await expect(page).toHaveURL(/.*\/bookings/);
    
    // Find the newly created booking
    await expect(page.locator('text=Wellness Workshop')).toBeVisible();
test('Booking with invalid payment details should show error', async ({ page }) => {
    // Navigate to events page and select an event
    await page.click('text=Events');
    await page.click('text=Wellness Workshop');

    await page.click('button:has-text("Book Now")');
    
    // Fill in booking details
    await page.selectOption('select[name="participants"]', '1');
    

    // Handle date/time selection if present
    const hasDateSelection = await page.locator('select[name="date"]').count() > 0;
    if (hasDateSelection) {
      await page.selectOption('select[name="date"]', { index: 1 });
      await page.selectOption('select[name="time"]', { index: 1 });
// Proceed to payment

    await page.click('button:has-text("Continue to Payment")');
    
    // Fill in invalid card details
    await page.fill('input[name="cardNumber"]', '4242424242424241'); // Invalid last digit
    await page.fill('input[name="cardExpiry"]', '12/28');
    await page.fill('input[name="cardCvc"]', '123');
    await page.fill('input[name="billingName"]', 'Test User');
    
    // Submit payment

    await page.click('button:has-text("Complete Booking")');
    
    // Verify error message appears
    await expect(page.locator('text=Your card number is invalid')).toBeVisible();
test('Booking with insufficient participant info should show validation errors', async ({ page }) => {
    // Navigate to events page and select an event
    await page.click('text=Events');
    await page.click('text=Wellness Workshop');

    await page.click('button:has-text("Book Now")');
    
    // Try to proceed without selecting number of participants

    await page.click('button:has-text("Continue to Payment")');
    
    // Verify validation error
    await expect(page.locator('text=Please select the number of participants')).toBeVisible();
test('User can cancel booking during the process', async ({ page }) => {
    // Navigate to events page and select an event
    await page.click('text=Events');
    await page.click('text=Wellness Workshop');

    await page.click('button:has-text("Book Now")');
    
    // Fill in some details
    await page.selectOption('select[name="participants"]', '2');
    
    // Click cancel button

    await page.click('button:has-text("Cancel")');
    
    // Verify user is returned to event details page

    await expect(page.locator('h1:has-text("Wellness Workshop")')).toBeVisible();

    await expect(page.locator('button:has-text("Book Now")')).toBeVisible();
