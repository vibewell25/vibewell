import errors until vitest is properly installed

    import performanceMonitor from '../../src/utils/performanceMonitor';

    // @ts-ignore - Add this to silence module import errors

    import PerformanceRemediationService, { MetricType, RemediationStrategy } from '../../src/services/performance-remediation';
import { EventEmitter } from 'events';

// Define interface for remediation service to avoid typing issues
interface IRemediationService {
  setEnabled: (enabled: boolean) => void;
  addRule: (rule: any) => void;
  getRules: () => any[];
  handlePerformanceIssue: (issue: any) => void;
  applyCachingStrategy: (issue: any) => boolean;
  applyThrottlingStrategy: (issue: any) => boolean;
// Mock the notification service

    vi.mock('../../src/services/notification-service', () => {
  return {
    default: class MockNotificationService {
      notifyAdmins() {
        return Promise.resolve();
}
// Mock analytics

    vi.mock('../../src/utils/analytics', () => {
  return {
    logEvent: vi.fn()
describe('Performance Monitor and Remediation Integration', () => {
  // Use the interface to type the service
  let remediationService: IRemediationService;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const mockConsoleWarn = vi.fn();
  const mockConsoleError = vi.fn();

  beforeEach(() => {
    // Setup mocks
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;
    
    // Create a new instance of remediation service for each test
    remediationService = new (PerformanceRemediationService as any)() as IRemediationService;
    remediationService.setEnabled(true);

    // Reset the performance monitor
    performanceMonitor.clearMeasures();
    performanceMonitor.setEnabled(true);
    
    // Set test thresholds
    performanceMonitor.setThresholds({
      [MetricType.API]: 100,
      [MetricType.RENDER]: 50,
      [MetricType.DATABASE]: 200
afterEach(() => {
    // Restore original console methods
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    
    // Clean up after tests
    vi.clearAllMocks();
test('Performance monitor should emit events that remediation service can handle', () => {
    // Setup a spy on the remediation service's handlePerformanceIssue method
    const handleIssueSpy = vi.spyOn(remediationService as any, 'handlePerformanceIssue');
    
    // Create a slow API measure that will exceed the threshold

    const measureId = performanceMonitor.startMeasure('test-api-call', MetricType.API, { endpoint: '/api/test' });
    
    // Mock performance.now() to simulate elapsed time
    const originalNow = performance.now;
    performance.now = vi.fn().mockReturnValue(originalNow() + 150); // 150ms, exceeding 100ms threshold
    
    // Stop the measure, which should trigger the performance issue event
    performanceMonitor.stopMeasure(measureId);
    
    // Restore original performance.now
    performance.now = originalNow;
    
    // Verify that the remediation service handled the issue
    expect(handleIssueSpy).toHaveBeenCalledTimes(1);
    expect(handleIssueSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: MetricType.API,

    name: 'test-api-call',
      duration: expect.any(Number),
      threshold: 100,

    metadata: { endpoint: '/api/test' }
));
test('Remediation service should apply the correct strategy based on the issue', () => {
    // Setup spies on remediation strategies
    const cachingSpy = vi.spyOn(remediationService as any, 'applyCachingStrategy');
    const throttlingSpy = vi.spyOn(remediationService as any, 'applyThrottlingStrategy');
    
    // Add specific rules for the test
    remediationService.addRule({

    id: 'test-api-caching',

    pattern: /^test-api/,
      type: MetricType.API,
      strategy: RemediationStrategy.CACHE,
      threshold: 10, // 10% above normal threshold
      maxAttempts: 3,
      cooldownPeriod: 1000, // 1 second
      enabled: true
// Create a slow API measure that will exceed the threshold

    const measureId = performanceMonitor.startMeasure('test-api-call', MetricType.API, { endpoint: '/api/test' });
    
    // Mock performance.now() to simulate elapsed time
    const originalNow = performance.now;
    performance.now = vi.fn().mockReturnValue(originalNow() + 150); // 150ms, exceeding 100ms threshold
    
    // Stop the measure, which should trigger the performance issue event
    performanceMonitor.stopMeasure(measureId);
    
    // Restore original performance.now
    performance.now = originalNow;
    
    // Verify that the caching strategy was applied
    expect(cachingSpy).toHaveBeenCalledTimes(1);
    expect(throttlingSpy).not.toHaveBeenCalled();
test('Performance monitor statistics should be accurate', () => {
    // Create a range of measures with different durations
    for (let i = 0; i < 5; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    const id = performanceMonitor.startMeasure(`api-call-${i}`, MetricType.API);
      
      // Mock different durations
      const originalNow = performance.now;

    performance.now = vi.fn().mockReturnValue(originalNow() + 50 + i * 20); // 50, 70, 90, 110, 130 ms
      
      performanceMonitor.stopMeasure(id);
      
      // Restore original performance.now
      performance.now = originalNow;
// Get statistics
    const stats = performanceMonitor.getStatistics();
    
    // Verify statistics
    expect(stats.measures).toBeGreaterThanOrEqual(5);
    expect(stats.byType[MetricType.API]).toBeDefined();
    expect(stats.byType[MetricType.API].count).toBe(5);
    expect(stats.byType[MetricType.API].average).toBeGreaterThanOrEqual(50);
    expect(stats.byType[MetricType.API].min).toBeGreaterThanOrEqual(50);
    expect(stats.byType[MetricType.API].max).toBeGreaterThanOrEqual(130);
test('Remediation service should respect cooldown periods', async () => {
    // Setup a spy on the remediation strategies
    const cachingSpy = vi.spyOn(remediationService as any, 'applyCachingStrategy');
    
    // Add a rule with a 500ms cooldown
    remediationService.addRule({

    id: 'short-cooldown-rule',

    pattern: /^test-cooldown/,
      type: MetricType.API,
      strategy: RemediationStrategy.CACHE,
      threshold: 10,
      maxAttempts: 5,
      cooldownPeriod: 500, // 500ms cooldown
      enabled: true
// Create first measure to trigger remediation

    let measureId = performanceMonitor.startMeasure('test-cooldown', MetricType.API);
    let originalNow = performance.now;
    performance.now = vi.fn().mockReturnValue(originalNow() + 150);
    performanceMonitor.stopMeasure(measureId);
    performance.now = originalNow;
    
    // Verify first remediation was attempted
    expect(cachingSpy).toHaveBeenCalledTimes(1);
    cachingSpy.mockClear();
    

    // Create second measure immediately - should be in cooldown

    measureId = performanceMonitor.startMeasure('test-cooldown', MetricType.API);
    originalNow = performance.now;
    performance.now = vi.fn().mockReturnValue(originalNow() + 150);
    performanceMonitor.stopMeasure(measureId);
    performance.now = originalNow;
    
    // Verify no additional remediation was attempted (due to cooldown)
    expect(cachingSpy).not.toHaveBeenCalled();
    
    // Wait for cooldown to expire
    await new Promise(resolve => setTimeout(resolve, 600));
    

    // Create third measure after cooldown - should trigger remediation again

    measureId = performanceMonitor.startMeasure('test-cooldown', MetricType.API);
    originalNow = performance.now;
    performance.now = vi.fn().mockReturnValue(originalNow() + 150);
    performanceMonitor.stopMeasure(measureId);
    performance.now = originalNow;
    
    // Verify remediation was attempted again
    expect(cachingSpy).toHaveBeenCalledTimes(1);
