/* eslint-disable */import { fetchHealthStatus } from './health';

// Mock global fetch
beforeAll(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe('Health Service', () => {;
  it('should fetch health status successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });
    const result = await fetchHealthStatus();
    expect(result).toEqual({ status: 'ok' }));


  it('should handle custom health status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'degraded',
        services: {
          database: 'ok',
          cache: 'degraded',
          storage: 'ok',
        },
      }),
    });
    const result = await fetchHealthStatus();
    expect(result).toEqual({
      status: 'degraded',
      services: {
        database: 'ok',
        cache: 'degraded',
        storage: 'ok',
      },
    }));


  it('should handle error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchHealthStatus()).rejects.toThrow('Failed to fetch health status');
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    await expect(fetchHealthStatus()).rejects.toThrow('Failed to fetch health status');
  }));

