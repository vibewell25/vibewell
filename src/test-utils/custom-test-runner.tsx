/**
 * Custom Test Runner implementation
 *
 * This module provides a test runner implementation with event emitters
 * for manually running test suites outside of the Jest environment.
 */
import { EventEmitter } from 'events';

/**
 * Test status enum representing possible test outcomes
 */
export enum TestStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  SKIPPED = 'skipped',
}

/**
 * Test case interface representing a single test
 */
export interface TestCase {
  name: string;
  fn: () => boolean | Promise<boolean>;
  timeout: number;
}

/**
 * Test suite interface representing a group of tests
 */
export interface TestSuite {
  name: string;
  tests: TestCase[];
}

/**
 * Test result interface representing the outcome of a test
 */
export interface TestResult {
  name: string;
  status: TestStatus;
  duration: number;
  error?: Error;
}

/**
 * Suite result interface representing the outcome of a test suite
 */
export interface SuiteResult {
  name: string;
  tests: TestResult[];
  duration: number;
}

/**
 * Test runner events
 */
interface TestRunnerEvents {
  testStart: (test: TestCase, suite: TestSuite) => void;
  testComplete: (result: TestResult, suite: TestSuite) => void;
  suiteStart: (suite: TestSuite) => void;
  suiteComplete: (result: SuiteResult) => void;
  complete: (results: SuiteResult[]) => void;
}

/**
 * TestRunner class for running test suites and emitting events
 */
export class TestRunner {
  private results: SuiteResult[] = [];
  private emitter = new EventEmitter();

  /**
   * Register an event listener
   */
  on<K extends keyof TestRunnerEvents>(event: K, listener: TestRunnerEvents[K]): void {
    this.emitter.on(event, listener as any);
  }

  /**
   * Get test results
   */
  getResults(): SuiteResult[] {
    return this.results;
  }

  /**
   * Get a summary of test results
   */
  getSummary(): { total: number; passed: number; failed: number; timedOut: number } {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let timedOut = 0;

    for (const suite of this.results) {
      for (const test of suite.tests) {
        total++;
        if (test.status === TestStatus.PASSED) passed++;
        if (test.status === TestStatus.FAILED) failed++;
        if (test.status === TestStatus.TIMEOUT) timedOut++;
      }
    }

    return { total, passed, failed, timedOut };
  }

  /**
   * Run test suites
   */
  async run(suites: TestSuite[]): Promise<SuiteResult[]> {
    this.results = [];

    for (const suite of suites) {
      this.emitter.emit('suiteStart', suite);

      const suiteStartTime = Date.now();
      const suiteResults: TestResult[] = [];

      for (const test of suite.tests) {
        this.emitter.emit('testStart', test, suite);

        const testStartTime = Date.now();
        let status = TestStatus.PENDING;
        let error: Error | undefined;

        try {
          // Run the test with timeout handling
          const result = await Promise.race([
            Promise.resolve(test.fn()),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Test "${test.name}" timed out after ${test.timeout}ms`));
              }, test.timeout);
            }),
          ]);

          status = result === false ? TestStatus.FAILED : TestStatus.PASSED;
        } catch (err: unknown) {
          status =
            err instanceof Error && err.message.includes('timed out')
              ? TestStatus.TIMEOUT
              : TestStatus.FAILED;
          error = err instanceof Error ? err : new Error(String(err));
        }

        const duration = Date.now() - testStartTime;
        const result: TestResult = {
          name: test.name,
          status,
          duration,
          error,
        };

        suiteResults.push(result);
        this.emitter.emit('testComplete', result, suite);
      }

      const suiteDuration = Date.now() - suiteStartTime;
      const suiteResult: SuiteResult = {
        name: suite.name,
        tests: suiteResults,
        duration: suiteDuration,
      };

      this.results.push(suiteResult);
      this.emitter.emit('suiteComplete', suiteResult);
    }

    this.emitter.emit('complete', this.results);
    return this.results;
  }
}

/**
 * Run test suites and return results
 */
export async function runTests(suites: TestSuite[]): Promise<SuiteResult[]> {
  const runner = new TestRunner();
  return await runner.run(suites);
}
