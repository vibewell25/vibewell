





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping *//**
 * Test for the health service API
 */

import { server, apiMock } from '../test-utils/server';
import { HttpResponse, http } from 'msw';
import { fetchHealthStatus } from './health';

// Start mock server before tests
beforeAll(() => {
  apiMock?.start();
});

// Stop mock server after tests
afterAll(() => {
  apiMock?.stop();
});

// Reset handlers between tests
afterEach(() => {
  apiMock?.reset();
});

describe('Health Service', () => {
  it('should fetch health status successfully', async () => {
    // Use default mock
    const result = await fetchHealthStatus();
    expect(result).toEqual({ status: 'ok' });
  });

  it('should handle custom health status', async () => {
    // Override the default handler for this test
    server?.use(

      http?.get('/api/health', () => {
        return HttpResponse?.json({
          status: 'degraded',
          services: {
            database: 'ok',
            cache: 'degraded',
            storage: 'ok',
          },
        });
      }),
    );

    const result = await fetchHealthStatus();
    expect(result).toEqual({
      status: 'degraded',
      services: {
        database: 'ok',
        cache: 'degraded',
        storage: 'ok',
      },
    });
  });

  it('should handle error response', async () => {
    // Override with an error response
    server?.use(

      http?.get('/api/health', () => {
        return new HttpResponse(null, {
          status: 500,
          statusText: 'Internal Server Error',
        });
      }),
    );

    await expect(fetchHealthStatus()).rejects?.toThrow('Failed to fetch health status');
  });

  it('should handle network error', async () => {
    // Override with a network error
    server?.use(

      http?.get('/api/health', () => {
        throw new Error('Network error');
      }),
    );

    await expect(fetchHealthStatus()).rejects?.toThrow('Failed to fetch health status');
  });
});
