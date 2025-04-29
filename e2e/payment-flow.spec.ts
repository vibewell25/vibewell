import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PaymentStatus } from '@prisma/client';

test.describe('Payment Flow', () => {
  let authToken: string;
  
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Login and get auth token
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', process.env['TEST_USER_EMAIL'] || 'test@example.com');
    await page.fill('[data-testid="password-input"]', process.env['TEST_USER_PASSWORD'] || 'testpass123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login to complete and get token
    await page.waitForURL('/dashboard');
    authToken = await page.evaluate(() => localStorage.getItem('auth_token') || '');
    expect(authToken).toBeTruthy();
  });

  test('complete booking with successful payment', async ({ page }: { page: Page }) => {
    // Navigate to service booking page
    await page.goto('/services/test-service');
    
    // Select time slot
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM'); // Select first available slot
    
    // Fill booking details
    await page.fill('[data-testid="booking-notes"]', 'Test booking notes');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Verify payment summary
    const amount = await page.textContent('[data-testid="payment-amount"]');
    expect(amount).toMatch(/\$\d+\.\d{2}/);
    
    // Enter test card details (using Stripe test card)
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Wait for payment processing and confirmation
    await page.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
    
    // Verify booking confirmation
    const bookingId = await page.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
    
    // Verify payment status in API
    const response = await page.request.get(`/api/payments/${bookingId}`);
    const paymentData = await response.json();
    expect(paymentData.status).toBe(PaymentStatus.COMPLETED);
  });

  test('handles failed payment gracefully', async ({ page }: { page: Page }) => {
    // Navigate to service booking page
    await page.goto('/services/test-service');
    
    // Select time slot
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    
    // Fill booking details
    await page.fill('[data-testid="booking-notes"]', 'Test booking notes');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Use Stripe test card for decline
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4000000000000002'); // Decline card
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Verify error message
    await page.waitForSelector('[data-testid="payment-error"]');
    const errorMessage = await page.textContent('[data-testid="payment-error"]');
    expect(errorMessage).toContain('Your card was declined');
    
    // Verify no booking was created
    const bookingId = await page.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeNull();
  });

  test('successful refund flow', async ({ page }: { page: Page }) => {
    // First create a successful booking
    await page.goto('/services/test-service');
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    await page.fill('[data-testid="booking-notes"]', 'Booking to be refunded');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Complete payment
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await page.click('[data-testid="submit-payment"]');
    
    // Wait for success and get booking ID
    await page.waitForSelector('[data-testid="payment-success"]');
    const bookingId = await page.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
    
    // Navigate to booking management
    await page.goto('/bookings');
    await page.click(`[data-booking-id="${bookingId}"]`);
    
    // Request refund
    await page.click('[data-testid="request-refund"]');
    await page.fill('[data-testid="refund-reason"]', 'Test refund request');
    await page.click('[data-testid="confirm-refund"]');
    
    // Verify refund success
    await page.waitForSelector('[data-testid="refund-success"]');
    
    // Verify refund status in API
    const response = await page.request.get(`/api/payments/${bookingId}`);
    const paymentData = await response.json();
    expect(paymentData.status).toBe(PaymentStatus.REFUNDED);
    expect(paymentData.refundedAt).toBeTruthy();
  });

  test('handles network errors during payment', async ({ page }: { page: Page }) => {
    // Navigate to service booking
    await page.goto('/services/test-service');
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    await page.fill('[data-testid="booking-notes"]', 'Test booking notes');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Simulate offline mode before payment submission
    await page.route('**/api/payments/**', (route) => route.abort('internetdisconnected'));
    
    // Attempt payment
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await page.click('[data-testid="submit-payment"]');
    
    // Verify error handling
    await page.waitForSelector('[data-testid="network-error"]');
    const errorMessage = await page.textContent('[data-testid="network-error"]');
    expect(errorMessage).toContain('network');
    
    // Verify retry button presence
    await page.waitForSelector('[data-testid="retry-payment"]');
    
    // Remove network block and retry
    await page.unroute('**/api/payments/**');
    await page.click('[data-testid="retry-payment"]');
    
    // Verify successful completion after retry
    await page.waitForSelector('[data-testid="payment-success"]');
    const bookingId = await page.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
  });

  test('handles 3D Secure authentication', async ({ page }: { page: Page }) => {
    await page.goto('/services/test-service');
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    await page.fill('[data-testid="booking-notes"]', 'Test 3D Secure');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Use 3D Secure test card
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4000000000003220');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    
    await page.click('[data-testid="submit-payment"]');
    
    // Handle 3D Secure popup
    const popup = await page.waitForEvent('popup');
    await popup.waitForLoadState();
    await popup.click('#test-source-authorize-3ds');
    
    // Verify successful payment after 3D Secure
    await page.waitForSelector('[data-testid="payment-success"]');
    const bookingId = await page.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
  });

  test('handles insufficient funds', async ({ page }: { page: Page }) => {
    await page.goto('/services/test-service');
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    await page.fill('[data-testid="booking-notes"]', 'Test insufficient funds');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Use insufficient funds test card
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4000000000009995');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    
    await page.click('[data-testid="submit-payment"]');
    
    // Verify error message
    await page.waitForSelector('[data-testid="payment-error"]');
    const errorMessage = await page.textContent('[data-testid="payment-error"]');
    expect(errorMessage).toContain('insufficient funds');
    
    // Verify retry option
    await page.waitForSelector('[data-testid="try-different-card"]');
  });

  test('handles partial refunds', async ({ page }: { page: Page }) => {
    // Create initial booking
    await page.goto('/services/test-service');
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    await page.fill('[data-testid="booking-notes"]', 'Test partial refund');
    await page.click('[data-testid="continue-to-payment"]');
    
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await page.click('[data-testid="submit-payment"]');
    
    await page.waitForSelector('[data-testid="payment-success"]');
    const bookingId = await page.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    
    // Navigate to refund page
    await page.goto('/bookings');
    await page.click(`[data-booking-id="${bookingId}"]`);
    await page.click('[data-testid="request-refund"]');
    
    // Request partial refund
    await page.fill('[data-testid="refund-amount"]', '50');
    await page.fill('[data-testid="refund-reason"]', 'Partial refund test');
    await page.click('[data-testid="confirm-refund"]');
    
    // Verify partial refund status
    await page.waitForSelector('[data-testid="refund-success"]');
    const response = await page.request.get(`/api/payments/${bookingId}`);
    const paymentData = await response.json();
    expect(paymentData.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    expect(paymentData.refundAmount).toBe(50);
  });

  test('handles rate limiting on multiple payment attempts', async ({ page }: { page: Page }) => {
    await page.goto('/services/test-service');
    await page.click('[data-testid="time-slot-selector"]');
    await page.click('text=2:00 PM');
    await page.click('[data-testid="continue-to-payment"]');
    
    const stripeFrame = await page.frameLocator('iframe[name^="__stripe_elements_"]').first();
    
    // Attempt multiple failed payments
    for (let i = 0; i < 5; i++) {
      await stripeFrame.locator('[placeholder="Card number"]').fill('4000000000000002');
      await stripeFrame.locator('[placeholder="MM / YY"]').fill('1230');
      await stripeFrame.locator('[placeholder="CVC"]').fill('123');
      await page.click('[data-testid="submit-payment"]');
      
      // Wait for error and retry button
      await page.waitForSelector('[data-testid="payment-error"]');
      if (i < 4) {
        await page.click('[data-testid="retry-payment"]');
      }
    }
    
    // Verify rate limit error
    const errorMessage = await page.textContent('[data-testid="payment-error"]');
    expect(errorMessage).toContain('Too many payment attempts');
    
    // Verify cooldown period
    await expect(page.locator('[data-testid="retry-payment"]')).toBeDisabled();
    await expect(page.locator('[data-testid="retry-countdown"]')).toBeVisible();
  });
}); 