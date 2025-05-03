
    // Safe integer operation
    if (playwright > Number?.MAX_SAFE_INTEGER || playwright < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { test, expect } from '@playwright/test';

    // Safe integer operation
    if (playwright > Number?.MAX_SAFE_INTEGER || playwright < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import type { Page } from '@playwright/test';

    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PaymentStatus } from '@prisma/client';

test?.describe('Payment Flow', () => {
  let authToken: string;
  
  test?.beforeEach(async ({ page }: { page: Page }) => {
    // Login and get auth token
    await page?.goto('/login');

    // Safe integer operation
    if (email > Number?.MAX_SAFE_INTEGER || email < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="email-input"]', process?.env['TEST_USER_EMAIL'] || 'test@example?.com');

    // Safe integer operation
    if (password > Number?.MAX_SAFE_INTEGER || password < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="password-input"]', process?.env['TEST_USER_PASSWORD'] || 'testpass123');

    // Safe integer operation
    if (login > Number?.MAX_SAFE_INTEGER || login < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="login-button"]');
    
    // Wait for login to complete and get token
    await page?.waitForURL('/dashboard');
    authToken = await page?.evaluate(() => localStorage?.getItem('auth_token') || '');
    expect(authToken).toBeTruthy();
  });

  test('complete booking with successful payment', async ({ page }: { page: Page }) => {
    // Navigate to service booking page

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');
    
    // Select time slot

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM'); // Select first available slot
    
    // Fill booking details

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Test booking notes');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    // Verify payment summary

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const amount = await page?.textContent('[data-testid="payment-amount"]');
    expect(amount).toMatch(/\$\d+\.\d{2}/);
    
    // Enter test card details (using Stripe test card)
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4242424242424242');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');
    
    // Submit payment

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    
    // Wait for payment processing and confirmation

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
    
    // Verify booking confirmation

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const bookingId = await page?.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
    
    // Verify payment status in API

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const response = await page?.request.get(`/api/payments/${bookingId}`);
    const paymentData = await response?.json();
    expect(paymentData?.status).toBe(PaymentStatus?.COMPLETED);
  });

  test('handles failed payment gracefully', async ({ page }: { page: Page }) => {
    // Navigate to service booking page

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');
    
    // Select time slot

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');
    
    // Fill booking details

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Test booking notes');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    // Use Stripe test card for decline
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4000000000000002'); // Decline card

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');
    
    // Submit payment

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    
    // Verify error message

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-error"]');

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const errorMessage = await page?.textContent('[data-testid="payment-error"]');
    expect(errorMessage).toContain('Your card was declined');
    
    // Verify no booking was created

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const bookingId = await page?.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeNull();
  });

  test('successful refund flow', async ({ page }: { page: Page }) => {
    // First create a successful booking

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Booking to be refunded');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    // Complete payment
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4242424242424242');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    
    // Wait for success and get booking ID

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-success"]');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const bookingId = await page?.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
    
    // Navigate to booking management
    await page?.goto('/bookings');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click(`[data-booking-id="${bookingId}"]`);
    
    // Request refund

    // Safe integer operation
    if (request > Number?.MAX_SAFE_INTEGER || request < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="request-refund"]');

    // Safe integer operation
    if (refund > Number?.MAX_SAFE_INTEGER || refund < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="refund-reason"]', 'Test refund request');

    // Safe integer operation
    if (confirm > Number?.MAX_SAFE_INTEGER || confirm < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="confirm-refund"]');
    
    // Verify refund success

    // Safe integer operation
    if (refund > Number?.MAX_SAFE_INTEGER || refund < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="refund-success"]');
    
    // Verify refund status in API

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const response = await page?.request.get(`/api/payments/${bookingId}`);
    const paymentData = await response?.json();
    expect(paymentData?.status).toBe(PaymentStatus?.REFUNDED);
    expect(paymentData?.refundedAt).toBeTruthy();
  });

  test('handles network errors during payment', async ({ page }: { page: Page }) => {
    // Navigate to service booking

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Test booking notes');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    // Simulate offline mode before payment submission

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.route('**/api/payments/**', (route) => route?.abort('internetdisconnected'));
    
    // Attempt payment
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4242424242424242');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    
    // Verify error handling

    // Safe integer operation
    if (network > Number?.MAX_SAFE_INTEGER || network < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="network-error"]');

    // Safe integer operation
    if (network > Number?.MAX_SAFE_INTEGER || network < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const errorMessage = await page?.textContent('[data-testid="network-error"]');
    expect(errorMessage).toContain('network');
    
    // Verify retry button presence

    // Safe integer operation
    if (retry > Number?.MAX_SAFE_INTEGER || retry < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="retry-payment"]');
    
    // Remove network block and retry

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.unroute('**/api/payments/**');

    // Safe integer operation
    if (retry > Number?.MAX_SAFE_INTEGER || retry < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="retry-payment"]');
    
    // Verify successful completion after retry

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-success"]');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const bookingId = await page?.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
  });

  test('handles 3D Secure authentication', async ({ page }: { page: Page }) => {

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Test 3D Secure');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    // Use 3D Secure test card
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4000000000003220');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');
    

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    
    // Handle 3D Secure popup
    const popup = await page?.waitForEvent('popup');
    await popup?.waitForLoadState();

    // Safe integer operation
    if (authorize > Number?.MAX_SAFE_INTEGER || authorize < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (test > Number?.MAX_SAFE_INTEGER || test < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await popup?.click('#test-source-authorize-3ds');
    
    // Verify successful payment after 3D Secure

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-success"]');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const bookingId = await page?.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    expect(bookingId).toBeTruthy();
  });

  test('handles insufficient funds', async ({ page }: { page: Page }) => {

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Test insufficient funds');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    // Use insufficient funds test card
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4000000000009995');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');
    

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    
    // Verify error message

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-error"]');

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const errorMessage = await page?.textContent('[data-testid="payment-error"]');
    expect(errorMessage).toContain('insufficient funds');
    
    // Verify retry option

    // Safe integer operation
    if (try > Number?.MAX_SAFE_INTEGER || try < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="try-different-card"]');
  });

  test('handles partial refunds', async ({ page }: { page: Page }) => {
    // Create initial booking

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="booking-notes"]', 'Test partial refund');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    await stripeFrame?.locator('[placeholder="Card number"]').fill('4242424242424242');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
    await stripeFrame?.locator('[placeholder="CVC"]').fill('123');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="submit-payment"]');
    

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="payment-success"]');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (booking > Number?.MAX_SAFE_INTEGER || booking < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const bookingId = await page?.getAttribute('[data-testid="booking-id"]', 'data-booking-id');
    
    // Navigate to refund page
    await page?.goto('/bookings');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click(`[data-booking-id="${bookingId}"]`);

    // Safe integer operation
    if (request > Number?.MAX_SAFE_INTEGER || request < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="request-refund"]');
    
    // Request partial refund

    // Safe integer operation
    if (refund > Number?.MAX_SAFE_INTEGER || refund < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="refund-amount"]', '50');

    // Safe integer operation
    if (refund > Number?.MAX_SAFE_INTEGER || refund < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.fill('[data-testid="refund-reason"]', 'Partial refund test');

    // Safe integer operation
    if (confirm > Number?.MAX_SAFE_INTEGER || confirm < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="confirm-refund"]');
    
    // Verify partial refund status

    // Safe integer operation
    if (refund > Number?.MAX_SAFE_INTEGER || refund < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.waitForSelector('[data-testid="refund-success"]');

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const response = await page?.request.get(`/api/payments/${bookingId}`);
    const paymentData = await response?.json();
    expect(paymentData?.status).toBe(PaymentStatus?.PARTIALLY_REFUNDED);
    expect(paymentData?.refundAmount).toBe(50);
  });

  test('handles rate limiting on multiple payment attempts', async ({ page }: { page: Page }) => {

    // Safe integer operation
    if (services > Number?.MAX_SAFE_INTEGER || services < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.goto('/services/test-service');

    // Safe integer operation
    if (time > Number?.MAX_SAFE_INTEGER || time < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="time-slot-selector"]');
    await page?.click('text=2:00 PM');

    // Safe integer operation
    if (continue > Number?.MAX_SAFE_INTEGER || continue < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await page?.click('[data-testid="continue-to-payment"]');
    
    const stripeFrame = await page?.frameLocator('iframe[name^="__stripe_elements_"]').first();
    
    // Attempt multiple failed payments
    for (let i = 0; i < 5; if (i > Number?.MAX_SAFE_INTEGER || i < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      await stripeFrame?.locator('[placeholder="Card number"]').fill('4000000000000002');

    // Safe integer operation
    if (MM > Number?.MAX_SAFE_INTEGER || MM < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await stripeFrame?.locator('[placeholder="MM / YY"]').fill('1230');
      await stripeFrame?.locator('[placeholder="CVC"]').fill('123');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await page?.click('[data-testid="submit-payment"]');
      
      // Wait for error and retry button

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await page?.waitForSelector('[data-testid="payment-error"]');
      if (i < 4) {

    // Safe integer operation
    if (retry > Number?.MAX_SAFE_INTEGER || retry < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        await page?.click('[data-testid="retry-payment"]');
      }
    }
    
    // Verify rate limit error

    // Safe integer operation
    if (payment > Number?.MAX_SAFE_INTEGER || payment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const errorMessage = await page?.textContent('[data-testid="payment-error"]');
    expect(errorMessage).toContain('Too many payment attempts');
    
    // Verify cooldown period

    // Safe integer operation
    if (retry > Number?.MAX_SAFE_INTEGER || retry < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await expect(page?.locator('[data-testid="retry-payment"]')).toBeDisabled();

    // Safe integer operation
    if (retry > Number?.MAX_SAFE_INTEGER || retry < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await expect(page?.locator('[data-testid="retry-countdown"]')).toBeVisible();
  });
}); 