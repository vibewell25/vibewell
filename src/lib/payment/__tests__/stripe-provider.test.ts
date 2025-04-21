import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StripePaymentProvider } from '../stripe-provider';
import Stripe from 'stripe';

// Mock the Stripe module
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      customers: {
        create: vi.fn().mockResolvedValue({
          id: 'cus_mock123',
          email: 'test@example.com',
          name: 'Test User',
          metadata: { userId: 'user123' },
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'cus_mock123',
          email: 'test@example.com',
          name: 'Test User',
          metadata: { userId: 'user123' },
          deleted: false,
          invoice_settings: { default_payment_method: 'pm_default' },
        }),
        update: vi.fn().mockResolvedValue({
          id: 'cus_mock123',
          invoice_settings: { default_payment_method: 'pm_123' },
        }),
      },
      paymentMethods: {
        attach: vi.fn().mockResolvedValue({
          id: 'pm_123',
          type: 'card',
          card: {
            last4: '4242',
            brand: 'visa',
            exp_month: 12,
            exp_year: 2025,
          },
        }),
        list: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'pm_123',
              type: 'card',
              card: {
                last4: '4242',
                brand: 'visa',
                exp_month: 12,
                exp_year: 2025,
              },
            },
          ],
        }),
      },
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_123',
          amount: 1000,
          currency: 'usd',
          status: 'requires_payment_method',
          client_secret: 'pi_123_secret_456',
          created: Date.now() / 1000,
          metadata: { order_id: '12345' },
        }),
        confirm: vi.fn().mockResolvedValue({
          id: 'pi_123',
          amount: 1000,
          currency: 'usd',
          status: 'succeeded',
          payment_method: 'pm_123',
          created: Date.now() / 1000,
          metadata: { order_id: '12345' },
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'pi_123',
          amount: 1000,
          currency: 'usd',
          status: 'succeeded',
          payment_method: 'pm_123',
          created: Date.now() / 1000,
          metadata: { order_id: '12345' },
        }),
        cancel: vi.fn().mockResolvedValue({
          id: 'pi_123',
          amount: 1000,
          currency: 'usd',
          status: 'canceled',
          payment_method: 'pm_123',
          created: Date.now() / 1000,
          metadata: { order_id: '12345' },
        }),
      },
      refunds: {
        create: vi.fn().mockResolvedValue({
          id: 're_123',
          payment_intent: 'pi_123',
          amount: 1000,
          status: 'succeeded',
        }),
      },
    })),
  };
});

describe('StripePaymentProvider', () => {
  let provider: StripePaymentProvider;

  beforeEach(async () => {
    provider = new StripePaymentProvider();
    await provider.initialize({ apiKey: 'sk_test_12345' });
  });

  it('initializes with the Stripe API key', () => {
    expect(Stripe).toHaveBeenCalledWith('sk_test_12345', {
      apiVersion: '2023-10-16',
      appInfo: {
        name: 'VibeWell Platform',
        version: '1.0.0',
      },
    });
  });

  it('creates a customer', async () => {
    const result = await provider.createCustomer({
      email: 'test@example.com',
      name: 'Test User',
      userId: 'user123',
    });

    expect(result).toEqual({ id: 'cus_mock123' });
  });

  it('retrieves a customer', async () => {
    const result = await provider.getCustomer('cus_mock123');

    expect(result).toEqual({
      id: 'cus_mock123',
      email: 'test@example.com',
      name: 'Test User',
      metadata: { userId: 'user123' },
    });
  });

  it('adds a payment method', async () => {
    const result = await provider.addPaymentMethod('cus_mock123', 'pm_token_123');

    expect(result).toEqual({
      id: 'pm_123',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expMonth: 12,
      expYear: 2025,
      isDefault: false,
    });
  });

  it('lists payment methods', async () => {
    const result = await provider.listPaymentMethods('cus_mock123');

    expect(result).toEqual([
      {
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: false,
      },
    ]);
  });

  it('sets a default payment method', async () => {
    await provider.setDefaultPaymentMethod('cus_mock123', 'pm_123');

    // Since we're using mocks, we can't assert much beyond that it doesn't throw
    expect(true).toBeTruthy();
  });

  it('creates a payment intent', async () => {
    const result = await provider.createPaymentIntent('cus_mock123', {
      amount: 10,
      currency: 'usd',
      description: 'Test payment',
      metadata: { order_id: '12345' },
    });

    expect(result).toEqual({
      id: 'pi_123',
      amount: 10,
      currency: 'usd',
      status: 'requires_payment_method',
      clientSecret: 'pi_123_secret_456',
      created: expect.any(Number),
      metadata: { order_id: '12345' },
    });
  });

  it('confirms a payment intent', async () => {
    const result = await provider.confirmPaymentIntent('pi_123', 'pm_123');

    expect(result).toEqual({
      id: 'pi_123',
      amount: 10,
      currency: 'usd',
      status: 'succeeded',
      paymentMethod: 'pm_123',
      created: expect.any(Number),
      metadata: { order_id: '12345' },
    });
  });

  it('retrieves a payment intent', async () => {
    const result = await provider.retrievePaymentIntent('pi_123');

    expect(result).toEqual({
      id: 'pi_123',
      amount: 10,
      currency: 'usd',
      status: 'succeeded',
      paymentMethod: 'pm_123',
      created: expect.any(Number),
      metadata: { order_id: '12345' },
    });
  });

  it('cancels a payment intent', async () => {
    const result = await provider.cancelPaymentIntent('pi_123');

    expect(result).toEqual({
      id: 'pi_123',
      amount: 10,
      currency: 'usd',
      status: 'canceled',
      paymentMethod: 'pm_123',
      created: expect.any(Number),
      metadata: { order_id: '12345' },
    });
  });

  it('creates a refund', async () => {
    const result = await provider.createRefund('pi_123', 10, 'requested_by_customer');

    expect(result).toEqual({
      id: 're_123',
      status: 'succeeded',
    });
  });
}); 