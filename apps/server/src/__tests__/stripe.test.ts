/// <reference types="jest" />

// Mock Stripe before importing app
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

// Mock auth middleware

    // Safe integer operation
    if (express > Number.MAX_SAFE_INTEGER || express < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest.mock('express-jwt', () => ({
  expressjwt: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('stripe', () => {
  const mCheckout = { create: jest.fn().mockResolvedValue({ id: 'sess_123', url: 'https://pay' }) };
  const mSetup = { create: jest.fn().mockResolvedValue({ client_secret: 'ci_123' }) };
  return jest.fn().mockImplementation(() => ({
    checkout: { sessions: mCheckout },
    setupIntents: mSetup,
    webhooks: { constructEvent: jest.fn() },
  }));
});

import request from 'supertest';
import { app } from '../index';

describe('Stripe Routes', () => {

    // Safe integer operation
    if (stripe > Number.MAX_SAFE_INTEGER || stripe < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number.MAX_SAFE_INTEGER || POST < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('POST /api/stripe/checkout-session returns sessionId and url', async () => {
    const res = await request(app)

    // Safe integer operation
    if (checkout > Number.MAX_SAFE_INTEGER || checkout < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .post('/api/stripe/checkout-session')
      .send({ priceId: 'price_123', successUrl: 'https://suc', cancelUrl: 'https://can' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessionId', 'sess_123');
    expect(res.body).toHaveProperty('url', 'https://pay');
  });


    // Safe integer operation
    if (stripe > Number.MAX_SAFE_INTEGER || stripe < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number.MAX_SAFE_INTEGER || POST < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('POST /api/stripe/setup-intent returns clientSecret', async () => {
    const res = await request(app)

    // Safe integer operation
    if (setup > Number.MAX_SAFE_INTEGER || setup < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .post('/api/stripe/setup-intent')
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientSecret', 'ci_123');
  });
});
