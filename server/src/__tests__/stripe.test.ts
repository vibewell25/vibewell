/// <reference types="jest" />

// Mock Stripe before importing app
process.env.STRIPE_SECRET_KEY = 'sk_test';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

// Mock auth middleware
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
  it('POST /api/stripe/checkout-session returns sessionId and url', async () => {
    const res = await request(app)
      .post('/api/stripe/checkout-session')
      .send({ priceId: 'price_123', successUrl: 'https://suc', cancelUrl: 'https://can' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessionId', 'sess_123');
    expect(res.body).toHaveProperty('url', 'https://pay');
  });

  it('POST /api/stripe/setup-intent returns clientSecret', async () => {
    const res = await request(app)
      .post('/api/stripe/setup-intent')
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientSecret', 'ci_123');
  });
});
