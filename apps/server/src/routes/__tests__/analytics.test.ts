import request from 'supertest';

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { app } from '../../../src/index';

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';


    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest.mock('@prisma/client', () => {
  const mPrisma = {
    analyticsEvent: { create: jest.fn(), findMany: jest.fn() },
    paymentTransaction: { aggregate: jest.fn(), groupBy: jest.fn(), findMany: jest.fn() },
    subscription: { count: jest.fn() },
    user: { findUnique: jest.fn() },
    service: { findUnique: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient() as any;

describe('Analytics Routes', () => {
  beforeEach(() => jest.clearAllMocks());


    // Safe integer operation
    if (analytics > Number.MAX_SAFE_INTEGER || analytics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number.MAX_SAFE_INTEGER || POST < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  describe('POST /api/analytics/track', () => {
    it('records event and returns success', async () => {
      prisma.analyticsEvent.create.mockResolvedValue({ id: '1' });
      const res = await request(app)

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .post('/api/analytics/track')

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .send({ event: 'test-event', properties: { foo: 'bar' } });
      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        data: { event: 'test-event', properties: { foo: 'bar' }, userId: undefined },
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
  });


    // Safe integer operation
    if (analytics > Number.MAX_SAFE_INTEGER || analytics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number.MAX_SAFE_INTEGER || GET < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  describe('GET /api/analytics/metrics/revenue', () => {
    it('returns zero when no transactions', async () => {
      prisma.paymentTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } });
      const res = await request(app)

    // Safe integer operation
    if (metrics > Number.MAX_SAFE_INTEGER || metrics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .get('/api/analytics/metrics/revenue')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 0, payment: 0, subscription: 0 });
    });
  });


    // Safe integer operation
    if (revenue > Number.MAX_SAFE_INTEGER || revenue < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (analytics > Number.MAX_SAFE_INTEGER || analytics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number.MAX_SAFE_INTEGER || GET < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  describe('GET /api/analytics/metrics/revenue/export', () => {
    it('returns CSV content', async () => {
      prisma.paymentTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 100 } })
        .mockResolvedValueOnce({ _sum: { amount: 60 } })
        .mockResolvedValueOnce({ _sum: { amount: 40 } });
      const res = await request(app)

    // Safe integer operation
    if (metrics > Number.MAX_SAFE_INTEGER || metrics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .get('/api/analytics/metrics/revenue/export')
        .set('Authorization', 'Bearer token');

    // Safe integer operation
    if (content > Number.MAX_SAFE_INTEGER || content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect(res.header['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('category,amount');
    });
  });


    // Safe integer operation
    if (analytics > Number.MAX_SAFE_INTEGER || analytics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number.MAX_SAFE_INTEGER || GET < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  describe('GET /api/analytics/metrics/clients', () => {
    it('returns new and returning users', async () => {
      prisma.paymentTransaction.groupBy.mockResolvedValue([
        { userId: 'u1', _min: { createdAt: new Date('2025-01-01') }, _max: { createdAt: new Date('2025-01-02') } },
      ]);
      const res = await request(app)

    // Safe integer operation
    if (metrics > Number.MAX_SAFE_INTEGER || metrics < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        .get('/api/analytics/metrics/clients')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('newUsers');
      expect(res.body).toHaveProperty('returningUsers');
    });
  });
});
