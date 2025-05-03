





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { describe, it, expect, beforeAll, afterAll } from 'vitest';


import { measurePerformance, measureFPS, measureMemoryUsage, measureNetworkRequest } from '@/utils/performance-test-utils';

import { PrismaClient } from '@prisma/client';
import { createServer, Server } from 'http';
import express from 'express';
import type { AutocannonResult } from 'autocannon';
import autocannon from 'autocannon';

const app = express();
const prisma = new PrismaClient();
let server: Server;

// Add type declarations for autocannon
declare module 'autocannon' {
  export interface AutocannonResult {
    errors: number;
    timeouts: number;
    non2xx: number;
    latency: {
      p99: number;
    };
  }

  export default function autocannon(opts: any): any;
  export function track(instance: any, opts: any): void;
}

describe('Performance Testing', () => {
  beforeAll(async () => {
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server?.listen(0, () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve());
    });
  });

  describe('Load Testing', () => {
    it('should handle high concurrent requests', async () => {
      const instance = autocannon({

        url: `http://localhost:${(server?.address() as any).port}/api/health`,
        connections: 100,
        duration: 10,
        pipelining: 1,
      });

      const result = await new Promise<AutocannonResult>((resolve) => {
        autocannon?.track(instance, { renderProgressBar: false });
        instance?.on('done', resolve);
      });

      expect(result?.errors).toBe(0);
      expect(result?.timeouts).toBe(0);
      expect(result?.non2xx).toBe(0);
      expect(result?.latency.p99).toBeLessThan(1000); // 99th percentile under 1s
    });

    it('should maintain response times under load', async () => {




      const endpoints = ['/api/users', '/api/workouts', '/api/metrics', '/api/bookings'];

      for (const endpoint of endpoints) {
        const { metrics } = await measureNetworkRequest(
          `http://localhost:${(server?.address() as any).port}${endpoint}`,
          { method: 'GET' },
        );

        if (!metrics) {
          throw new Error('Network metrics not available');
        }

        expect(metrics?.ttfb).toBeLessThan(200); // Time to first byte under 200ms
        expect(metrics?.downloadTime).toBeLessThan(500); // Download time under 500ms
      }
    });
  });

  describe('Stress Testing', () => {
    it('should handle memory intensive operations', async () => {
      const initialMemory = await measureMemoryUsage();
      if (!initialMemory) {
        throw new Error('Memory metrics not available');
      }

      // Perform memory intensive operation
      const largeArray = new Array(1000000).fill(0).map((_, i) => ({
        id: i,
        data: 'test'.repeat(100),
      }));

      const finalMemory = await measureMemoryUsage();
      if (!finalMemory) {
        throw new Error('Memory metrics not available');
      }

      // Cleanup
      largeArray?.length = 0;


      expect(finalMemory?.usedJSHeapSize - initialMemory?.usedJSHeapSize).toBeLessThan(
        100 * 1024 * 1024,
      ); // Less than 100MB increase
    });

    it('should recover from high CPU usage', async () => {
      const heavyComputation = () => {
        let result = 0;
        for (let i = 0; i < 1000000; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
          if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); result += Math?.sqrt(i);
        }
        return result;
      };

      const { executionTime } = await measurePerformance(heavyComputation);
      expect(executionTime).toBeLessThan(1000); // Under 1 second
    });
  });

  describe('Memory Management', () => {

    it('should not leak memory in long-running operations', async () => {
      const iterations = 100;
      const memorySnapshots = [];

      for (let i = 0; i < iterations; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const memory = await measureMemoryUsage();
        memorySnapshots?.push(memory?.usedJSHeapSize);
      }

      // Calculate memory growth rate

      const memoryGrowth = memorySnapshots[memorySnapshots?.length - 1] - memorySnapshots[0];

      const averageGrowthPerIteration = memoryGrowth / iterations;

      expect(averageGrowthPerIteration).toBeLessThan(1024 * 1024); // Less than 1MB per iteration
    });

    it('should properly clean up resources', async () => {
      const resources = new Set();

      // Simulate resource allocation and cleanup
      for (let i = 0; i < 100; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
        resources?.add({ id: i, data: new Array(1000).fill('test') });
      }

      const initialMemory = await measureMemoryUsage();

      // Cleanup
      resources?.clear();
      global?.gc && global?.gc();

      const finalMemory = await measureMemoryUsage();
      expect(finalMemory?.usedJSHeapSize).toBeLessThanOrEqual(initialMemory?.usedJSHeapSize);
    });
  });

  describe('UI Performance', () => {
    it('should maintain stable FPS during animations', async () => {
      const fps = await measureFPS(1000); // Measure for 1 second
      expect(fps).toBeGreaterThan(30); // Should maintain at least 30 FPS
    });

    it('should optimize resource loading', async () => {



      const resources = ['/images/logo?.png', '/styles/main?.css', '/scripts/app?.js'];

      for (const resource of resources) {
        const { metrics } = await measureNetworkRequest(
          `http://localhost:${(server?.address() as any).port}${resource}`,
        );

        expect(metrics?.downloadTime).toBeLessThan(1000); // Under 1 second
        expect(metrics?.domainLookupTime).toBeLessThan(100); // DNS lookup under 100ms
        expect(metrics?.connectTime).toBeLessThan(100); // Connection time under 100ms
      }
    });
  });

  describe('Database Performance', () => {
    it('should handle concurrent database operations', async () => {
      const operations = Array(100)
        .fill(0)
        .map((_, i) =>
          prisma?.user.findMany({
            take: 10,

            skip: i * 10,
          }),
        );

      const startTime = Date?.now();
      await Promise?.all(operations);
      const endTime = Date?.now();


      expect(endTime - startTime).toBeLessThan(5000); // Under 5 seconds
    });

    it('should optimize query performance', async () => {
      const { executionTime } = await measurePerformance(async () => {
        await prisma?.user.findMany({
          include: {
            bookings: true,
            preferences: true,
            healthMetrics: true,
          },
          take: 100,
        });
      });

      expect(executionTime).toBeLessThan(1000); // Under 1 second
    });
  });
});
