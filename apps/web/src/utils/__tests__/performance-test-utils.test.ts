





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import {
  measurePerformance,
  measureFPS,
  measureMemoryUsage,
  measureNetworkRequest,
  createPerformanceReport,

} from '../performance-test-utils';

describe('Performance Test Utils', () => {
  beforeEach(() => {
    // Mock performance API
    global.performance = {
      now: jest.fn().mockReturnValue(0),
      memory: {
        jsHeapSizeLimit: 2000000000,
        totalJSHeapSize: 1000000000,
        usedJSHeapSize: 500000000,
      },
      getEntriesByName: jest.fn().mockReturnValue([
        {
          domainLookupStart: 0,
          domainLookupEnd: 100,
          connectStart: 100,
          connectEnd: 200,
          requestStart: 200,
          responseStart: 300,
          responseEnd: 400,
        },
      ]),
    } as any;

    // Mock requestAnimationFrame
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(performance.now()), 16) as any;
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should measure execution time', async () => {
    const mockFn = jest.fn().mockImplementation(() => {
      (performance.now as jest.Mock).mockReturnValue(100);
    });

    const result = await measurePerformance(mockFn);
    expect(result.executionTime).toBe(100);
  });

  it('should measure memory usage', async () => {
    const memory = await measureMemoryUsage();
    expect(memory).toEqual({
      jsHeapSizeLimit: 2000000000,
      totalJSHeapSize: 1000000000,
      usedJSHeapSize: 500000000,
    });
  });

  it('should measure network request timing', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const { metrics } = await measureNetworkRequest('https://api.example.com');
    expect(metrics).toEqual({
      domainLookupTime: 100,
      connectTime: 100,
      ttfb: 100,
      downloadTime: 100,
    });
  });

  it('should measure FPS', async () => {
    const fps = await measureFPS(100);
    expect(fps).toBeGreaterThan(0);
  });

  it('should create performance report', async () => {
    const report = await createPerformanceReport();
    expect(report).toHaveProperty('fps');
    expect(report).toHaveProperty('memory');
    expect(report).toHaveProperty('longTasks');
  });
});
