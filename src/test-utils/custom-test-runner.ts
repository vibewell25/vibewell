import { EventEmitter } from 'events';

/**
 * Test status enumerations
 */
export enum TestStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

/**
 * Test case definition
 */
export interface TestCase {
  name: string;
  fn: () => boolean | Promise<boolean>;
  timeout: number;
}

/**
 * Test suite definition
 */
export interface TestSuite {
  name: string;
  tests: TestCase[];
}

/**
 * Test result with status and timing
 */
export interface TestResult {
  name: string;
  status: TestStatus;
  duration?: number;
  error?: Error;
}

/**
 * Test summary statistics
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  timedOut: number;
  duration: number;
}

/**
 * Run all tests in all suites and return results
 */
export async function runTests(suites: TestSuite[]): Promise<{ name: string; tests: TestResult[] }[]> {
  const runner = new TestRunner();
  await runner.run(suites);
  return runner.getResults();
}

/**
 * Test runner implementation with event emitter for tracking progress
 */
export class TestRunner extends EventEmitter {
  private results: { name: string; tests: TestResult[] }[] = [];
  private startTime: number = 0;
  private endTime: number = 0;

  /**
   * Get test results after running
   */
  getResults(): { name: string; tests: TestResult[] }[] {
    return this.results;
  }

  /**
   * Get test summary statistics
   */
  getSummary(): TestSummary {
    const allTests = this.results.flatMap(suite => suite.tests);
    
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === TestStatus.PASSED).length,
      failed: allTests.filter(t => t.status === TestStatus.FAILED).length,
      timedOut: allTests.filter(t => t.status === TestStatus.TIMEOUT).length,
      duration: this.endTime - this.startTime,
    };
  }

  /**
   * Run all tests in all suites
   */
  async run(suites: TestSuite[]): Promise<void> {
    this.results = [];
    this.startTime = Date.now();
    
    for (const suite of suites) {
      this.emit('suiteStart', suite.name);
      
      const suiteResults: TestResult[] = [];
      
      for (const test of suite.tests) {
        this.emit('testStart', test.name);
        
        const result = await this.runTest(test);
        suiteResults.push(result);
        
        this.emit('testComplete', result);
      }
      
      this.results.push({
        name: suite.name,
        tests: suiteResults,
      });
      
      this.emit('suiteComplete', suite.name, suiteResults);
    }
    
    this.endTime = Date.now();
    this.emit('complete', this.getSummary());
  }

  /**
   * Run a single test case with timeout handling
   */
  private async runTest(test: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    let status = TestStatus.PENDING;
    let error: Error | undefined;
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Test timed out after ${test.timeout}ms: ${test.name}`));
        }, test.timeout);
      });
      
      // Run the test function
      const testPromise = Promise.resolve(test.fn());
      
      // Race the test against the timeout
      await Promise.race([testPromise, timeoutPromise]);
      
      status = TestStatus.PASSED;
    } catch (e) {
      status = e instanceof Error && e.message.includes('timed out') 
        ? TestStatus.TIMEOUT 
        : TestStatus.FAILED;
      
      if (e instanceof Error) {
        error = e;
      } else if (typeof e === 'string') {
        error = new Error(e);
      } else {
        error = new Error('Unknown error');
      }
    }
    
    const endTime = Date.now();
    
    return {
      name: test.name,
      status,
      duration: endTime - startTime,
      error,
    };
  }
} 