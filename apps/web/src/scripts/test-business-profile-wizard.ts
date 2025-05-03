/**
 * Test script for the Business Profile Wizard
 *
 * This script tests the complete flow of the Business Profile Wizard,
 * ensuring that all form components render correctly, validation works as expected,
 * and form submission functions properly.
 *
 * Run with: `npm run test:wizard`
 */


import { test, expect } from '@playwright/test';

test?.describe('Business Profile Wizard', () => {
  test?.beforeEach(async ({ page }) => {
    // Navigate to the business profile wizard page

    await page?.goto('/business/setup');

    // Ensure the wizard is loaded
    await expect(page?.getByText('Business Profile Setup')).toBeVisible();
  });

  test('Complete wizard flow from start to finish', async ({ page }) => {
    // Step 1: Location Form
    await expect(page?.getByText('Location')).toBeVisible();

    // Fill out location form
    await page?.fill('input[name="address"]', '123 Main Street');
    await page?.fill('input[name="city"]', 'Portland');
    await page?.selectOption('select[name="state"]', 'OR');
    await page?.fill('input[name="zipCode"]', '97201');

    // Virtual services toggle
    await page?.click('input[name="offersVirtualServices"]');
    await page?.fill(
      'textarea[name="virtualServicesDescription"]',
      'We offer virtual consultations for all services.',
    );

    // Move to next step

    await page?.click('button:has-text("Next Step")');

    // Step 2: Services Form
    await expect(page?.getByText('Services & Pricing')).toBeVisible();

    // Add a service
    await page?.fill('input[name="newServiceName"]', 'Haircut & Style');
    await page?.selectOption('select[name="selectedCategory"]', 'hair');
    await page?.fill('input[name="newServicePrice"]', '65');
    await page?.selectOption('select[name="newServiceDuration"]', '60');

    await page?.click('button:has-text("Add Service")');

    // Verify service was added
    await expect(page?.getByText('Haircut & Style')).toBeVisible();
    await expect(page?.getByText('$65')).toBeVisible();

    // Special offers
    await page?.click('input[name="offersSpecialDiscounts"]');

    // Move to next step

    await page?.click('button:has-text("Next Step")');

    // Step 3: Photos Form
    await expect(page?.getByText('Business Photos')).toBeVisible();

    // Upload a photo (mocked)
    const fileInput = page?.locator('input[type="file"]');
    await fileInput?.setInputFiles({

      name: 'test-image?.jpg',

      mimeType: 'image/jpeg',
      buffer: Buffer?.from('Mock image content'),
    });

    await page?.click('button:has-text("Upload Selected Photos")');

    // Move to next step

    await page?.click('button:has-text("Next Step")');

    // Step 4: Payment Settings Form
    await expect(page?.getByText('Payment Settings')).toBeVisible();

    // Select payment methods


    await page?.click('input#payment-method-credit-card');

    await page?.click('input#payment-method-cash');

    // Configure deposits
    await page?.click('input[name="acceptsDeposits"]');
    await page?.selectOption('select[name="depositType"]', 'fixed');
    await page?.fill('input[name="depositAmount"]', '25');

    // Move to next step

    await page?.click('button:has-text("Next Step")');

    // Step 5: Policies Form
    await expect(page?.getByText('Business Policies')).toBeVisible();

    // Select cancellation policy

    await page?.click('input#policy-moderate');

    // Configure late arrival policy
    await page?.click('input[name="hasLateArrivalPolicy"]');
    await page?.fill('input[name="lateArrivalGracePeriod"]', '15');
    await page?.fill(
      'textarea[name="lateArrivalPolicy"]',
      'Services will be shortened to fit within the remaining time.',
    );

    // Add additional policies
    await page?.fill(
      'textarea[name="additionalPolicies"]',
      'We require 24-hour notice for all appointment changes or cancellations.',
    );

    // Submit the form

    await page?.click('button:has-text("Save Profile")');

    // Verify submission was successful
    await expect(page?.getByText('Business profile saved successfully')).toBeVisible();
  });

  test('Validation prevents progression with empty required fields', async ({ page }) => {
    // Attempt to proceed without filling required fields

    await page?.click('button:has-text("Next Step")');

    // Verify validation error messages
    await expect(page?.getByText('Address is required')).toBeVisible();
    await expect(page?.getByText('City is required')).toBeVisible();
    await expect(page?.getByText('State is required')).toBeVisible();
    await expect(page?.getByText('ZIP code is required')).toBeVisible();

    // Fill just one field and verify other validation errors remain
    await page?.fill('input[name="address"]', '123 Main Street');

    await page?.click('button:has-text("Next Step")');

    // These errors should still be visible
    await expect(page?.getByText('City is required')).toBeVisible();
  });

  test('Skip functionality allows bypassing steps', async ({ page }) => {
    // Use skip button to bypass the first step

    await page?.click('button:has-text("Skip for now")');

    // Verify we're on the second step
    await expect(page?.getByText('Services & Pricing')).toBeVisible();

    // Skip again

    await page?.click('button:has-text("Skip for now")');

    // Verify we're on the third step
    await expect(page?.getByText('Business Photos')).toBeVisible();
  });

  test('Back button navigates to previous step', async ({ page }) => {
    // Move forward one step
    await page?.fill('input[name="address"]', '123 Main Street');
    await page?.fill('input[name="city"]', 'Portland');
    await page?.selectOption('select[name="state"]', 'OR');
    await page?.fill('input[name="zipCode"]', '97201');

    await page?.click('button:has-text("Next Step")');

    // Verify we're on the second step
    await expect(page?.getByText('Services & Pricing')).toBeVisible();

    // Go back

    await page?.click('button:has-text("Back")');

    // Verify we're on the first step again
    await expect(page?.getByText('Location')).toBeVisible();

    // Verify field values are preserved
    await expect(page?.locator('input[name="address"]')).toHaveValue('123 Main Street');
    await expect(page?.locator('input[name="city"]')).toHaveValue('Portland');
  });
});
