import errors until vitest is properly installed
import {
  runTests,
  TestRunner,
  TestSuite,
  TestCase,
  TestResult,
  TestStatus
from '../../src/test-utils/custom-test-runner';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

// Sample test suites for testing
const createSampleTests = (): TestSuite[] => [
  {
    name: 'Sample Suite 1',
    tests: [
      {
        name: 'Test 1',
        fn: () => true,
        timeout: 100
{
        name: 'Test 2',
        fn: () => {
          throw new Error('Intentional failure');
timeout: 100
{
        name: 'Async Test',
        fn: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return true;
timeout: 200
]
{
    name: 'Sample Suite 2',
    tests: [
      {
        name: 'Timeout Test',
        fn: async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          return true;
timeout: 100
]
];

describe('Test Runner', () => {
  beforeEach(() => {
    // Mock console methods
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    
    // Reset mocks
    vi.clearAllMocks();
afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
test('runTests should run all test suites', async () => {
    const suites = createSampleTests();
    const results = await runTests(suites);
    
    // We have 2 suites with 4 tests total
    expect(results.length).toBe(2);
    expect(results[0].tests.length).toBe(3);
    expect(results[1].tests.length).toBe(1);
    
    // Check status counts
    const allTests = [...results[0].tests, ...results[1].tests];
    const passCount = allTests.filter(t => t.status === TestStatus.PASSED).length;
    const failCount = allTests.filter(t => t.status === TestStatus.FAILED).length;
    const timeoutCount = allTests.filter(t => t.status === TestStatus.TIMEOUT).length;
    
    expect(passCount).toBe(2); // Test 1 and Async Test
    expect(failCount).toBe(1); // Test 2
    expect(timeoutCount).toBe(1); // Timeout Test
test('TestRunner class should execute tests and emit events', async () => {
    const runner = new TestRunner();
    const suites = createSampleTests();
    
    // Create event listeners
    const onTestStart = vi.fn();
    const onTestComplete = vi.fn();
    const onSuiteStart = vi.fn();
    const onSuiteComplete = vi.fn();
    const onComplete = vi.fn();
    
    // Register listeners
    runner.on('testStart', onTestStart);
    runner.on('testComplete', onTestComplete);
    runner.on('suiteStart', onSuiteStart);
    runner.on('suiteComplete', onSuiteComplete);
    runner.on('complete', onComplete);
    
    // Run tests
    await runner.run(suites);
    
    // Verify events were emitted
    expect(onTestStart).toHaveBeenCalledTimes(4); // 4 tests total
    expect(onTestComplete).toHaveBeenCalledTimes(4);
    expect(onSuiteStart).toHaveBeenCalledTimes(2); // 2 suites
    expect(onSuiteComplete).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
    
    // Check test results
    const results = runner.getResults();
    expect(results.length).toBe(2);
    
    // Check summary
    const summary = runner.getSummary();
    expect(summary.total).toBe(4);
    expect(summary.passed).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.timedOut).toBe(1);
test('TestRunner should handle empty test suites', async () => {
    const runner = new TestRunner();
    
    // Run with empty array
    await runner.run([]);
    
    // Get results
    const results = runner.getResults();
    const summary = runner.getSummary();
    
    // Verify
    expect(results.length).toBe(0);
    expect(summary.total).toBe(0);
    expect(summary.passed).toBe(0);
    expect(summary.failed).toBe(0);
    expect(summary.timedOut).toBe(0);
test('TestRunner should respect test timeouts', async () => {
    const runner = new TestRunner();
    

    // Create a test suite with a long-running test
    const suites: TestSuite[] = [
      {
        name: 'Timeout Suite',
        tests: [
          {
            name: 'Long Running Test',
            fn: async () => {
              await new Promise(resolve => setTimeout(resolve, 200));
              return true;
timeout: 50 // Should timeout after 50ms
]
];
    
    // Run tests
    await runner.run(suites);
    
    // Get results
    const results = runner.getResults();
    
    // Verify timeout
    expect(results[0].tests[0].status).toBe(TestStatus.TIMEOUT);
    expect(results[0].tests[0].error).toBeInstanceOf(Error);
    expect(results[0].tests[0].error.message).toContain('Timeout');
test('TestRunner should handle errors in test functions', async () => {
    const runner = new TestRunner();
    
    // Create a test suite with various error types
    const suites: TestSuite[] = [
      {
        name: 'Error Suite',
        tests: [
          {
            name: 'Error Test',
            fn: () => {
              throw new Error('Custom error');
timeout: 100
{
            name: 'String Error Test',
            fn: () => {
              throw 'String error';
timeout: 100
{
            name: 'Rejected Promise Test',
            fn: async () => {
              return Promise.reject(new Error('Promise rejection'));
timeout: 100
]
];
    
    // Run tests
    await runner.run(suites);
    
    // Get results
    const results = runner.getResults();
    const tests = results[0].tests;
    
    // Verify all tests failed with appropriate errors
    expect(tests[0].status).toBe(TestStatus.FAILED);
    expect(tests[0].error.message).toBe('Custom error');
    
    expect(tests[1].status).toBe(TestStatus.FAILED);
    expect(tests[1].error.message).toContain('String error');
    
    expect(tests[2].status).toBe(TestStatus.FAILED);
    expect(tests[2].error.message).toBe('Promise rejection');
test('TestRunner should report test durations', async () => {
    const runner = new TestRunner();
    
    // Create tests with different durations
    const suites: TestSuite[] = [
      {
        name: 'Duration Suite',
        tests: [
          {
            name: 'Fast Test',
            fn: () => true,
            timeout: 100
{
            name: 'Slow Test',
            fn: async () => {
              await new Promise(resolve => setTimeout(resolve, 50));
              return true;
timeout: 200
]
];
    
    // Run tests
    await runner.run(suites);
    
    // Get results
    const results = runner.getResults();
    const tests = results[0].tests;
    
    // Verify durations
    expect(tests[0].duration).toBeDefined();
    expect(tests[0].duration).toBeGreaterThanOrEqual(0);
    expect(tests[0].duration).toBeLessThan(50); // Fast test should be quick
    
    expect(tests[1].duration).toBeDefined();
    expect(tests[1].duration).toBeGreaterThanOrEqual(50); // Slow test should take at least 50ms
