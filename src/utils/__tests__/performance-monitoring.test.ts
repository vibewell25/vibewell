/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import {
  startComponentRender,
  endComponentRender,
  startApiCall,
  endApiCall,
  reportPerformanceViolation,
  getMetrics,
  checkBudgets,
  initPerformanceMonitoring,
} from '../performance-monitoring';

// Mock performance API
const originalPerformance = global.performance;
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn().mockReturnValue([{ duration: 100 }]),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  now: jest.fn().mockReturnValue(1000),
};

// Mock console
const originalConsole = global.console;
const mockConsole = {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

describe('Performance Monitoring', () => {
  beforeAll(() => {
    // @ts-expect-error - partial mock implementation
    global.performance = mockPerformance;
    // @ts-expect-error - partial mock implementation
    global.console = mockConsole;
  });

  afterAll(() => {
    global.performance = originalPerformance;
    global.console = originalConsole;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    initPerformanceMonitoring();
  });

  describe('Component rendering measurement', () => {
    it('should track component render time', () => {
      const markId = startComponentRender('TestComponent');
      expect(mockPerformance.mark).toHaveBeenCalledWith(
        expect.stringContaining('component-start-TestComponent'),
      );

      endComponentRender('TestComponent', markId);
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        expect.stringContaining('component-TestComponent'),
        expect.stringContaining('component-start-TestComponent'),
      );
    });
  });

  describe('API call measurement', () => {
    it('should track API call duration', () => {
      const markId = startApiCall('/api/test');
      expect(mockPerformance.mark).toHaveBeenCalledWith(
        expect.stringContaining('api-start-/api/test'),
      );

      endApiCall('/api/test', markId);
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        expect.stringContaining('api-/api/test'),
        expect.stringContaining('api-start-/api/test'),
      );
    });
  });

  describe('Performance violation reporting', () => {
    it('should report performance violations', () => {
      reportPerformanceViolation('TestComponent', 'render', 100, 50);
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Performance budget exceeded'),
        expect.stringContaining('TestComponent'),
        expect.stringContaining('render'),
      );
    });
  });

  describe('Metrics tracking', () => {
    it('should return collected metrics', () => {
      // Create some sample metrics
      startComponentRender('TestComponent');
      endComponentRender('TestComponent', 'test-mark-id');

      startApiCall('/api/test');
      endApiCall('/api/test', 'test-api-mark-id');

      const metrics = getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.components).toBeDefined();
      expect(metrics.api).toBeDefined();
    });
  });

  describe('Budget checking', () => {
    it('should check budgets against metrics', () => {
      // Mock metrics
      jest.spyOn(global, 'getMetrics').mockImplementation(() => ({
        components: { TestComponent: 100 },
        api: { '/api/test': 200 },
        core: { FCP: 300, LCP: 2500, CLS: 0.1 },
      }));

      checkBudgets();

      // Should warn for any violations
      expect(mockConsole.warn).toHaveBeenCalled();
    });
  });
});
