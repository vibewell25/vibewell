import request from 'supertest';
import { app } from '../../../src/index';
import { PrismaClient } from '@prisma/client';

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

  describe('POST /api/analytics/track', () => {
    it('records event and returns success', async () => {
      prisma.analyticsEvent.create.mockResolvedValue({ id: '1' });
      const res = await request(app)
        .post('/api/analytics/track')
        .send({ event: 'test-event', properties: { foo: 'bar' } });
      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: { event: 'test-event', properties: { foo: 'bar' }, userId: undefined },
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
  });

  describe('GET /api/analytics/metrics/revenue', () => {
    it('returns zero when no transactions', async () => {
      prisma.paymentTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } })
        .mockResolvedValueOnce({ _sum: { amount: 0 } });
      const res = await request(app)
        .get('/api/analytics/metrics/revenue')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ total: 0, payment: 0, subscription: 0 });
    });
  });

  describe('GET /api/analytics/metrics/revenue/export', () => {
    it('returns CSV content', async () => {
      prisma.paymentTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 100 } })
        .mockResolvedValueOnce({ _sum: { amount: 60 } })
        .mockResolvedValueOnce({ _sum: { amount: 40 } });
      const res = await request(app)
        .get('/api/analytics/metrics/revenue/export')
        .set('Authorization', 'Bearer token');
      expect(res.header['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('category,amount');
    });
  });

  describe('GET /api/analytics/metrics/clients', () => {
    it('returns new and returning users', async () => {
      prisma.paymentTransaction.groupBy.mockResolvedValue([
        { userId: 'u1', _min: { createdAt: new Date('2025-01-01') }, _max: { createdAt: new Date('2025-01-02') } },
      ]);
      const res = await request(app)
        .get('/api/analytics/metrics/clients')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('newUsers');
      expect(res.body).toHaveProperty('returningUsers');
    });
  });
});
