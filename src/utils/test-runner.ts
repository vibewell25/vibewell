/**
 * A lightweight test runner for running tests without Jest
 */

export type TestFunction = (name: string, fn: () => void) => void;
export type SuiteFunction = (name: string, fn: () => void) => void;

interface TestRunner {
  describe: SuiteFunction;
  test: TestFunction;
  it: TestFunction;
  expect: (value: any) => {
    toBe: (expected: any) => boolean;
    toBeDefined: () => boolean;
    toBeUndefined: () => boolean;
    toBeTruthy: () => boolean;
    toBeFalsy: () => boolean;
  };
  run: () => Promise<{
    passed: number;
    failed: number;
    total: number;
  }>;
}

/**
 * Creates a simple test runner for running tests without Jest
 */
export function createTestRunner(): TestRunner {
  const tests: Array<{
    suiteName: string;
    testName: string;
    fn: () => void;
    skip?: boolean;
  }> = [];

  let currentSuite = 'Default Suite';

  const describe: SuiteFunction = (name, fn) => {
    const previousSuite = currentSuite;
    currentSuite = name;
    fn();
    currentSuite = previousSuite;
  };

  const test: TestFunction = (name, fn) => {
    tests.push({
      suiteName: currentSuite,
      testName: name,
      fn,
    });
  };

  const it: TestFunction = test;

  const expect = (value: any) => ({
    toBe: (expected: any) => {
      const result = value === expected;
      if (!result) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
      return result;
    },
    toBeDefined: () => {
      const result = value !== undefined;
      if (!result) {
        throw new Error(`Expected value to be defined`);
      }
      return result;
    },
    toBeUndefined: () => {
      const result = value === undefined;
      if (!result) {
        throw new Error(`Expected value to be undefined`);
      }
      return result;
    },
    toBeTruthy: () => {
      const result = !!value;
      if (!result) {
        throw new Error(`Expected value to be truthy`);
      }
      return result;
    },
    toBeFalsy: () => {
      const result = !value;
      if (!result) {
        throw new Error(`Expected value to be falsy`);
      }
      return result;
    },
  });

  const run = async () => {
    let passed = 0;
    let failed = 0;

    console.log('Running tests...\n');

    for (const test of tests) {
      if (test.skip) {
        console.log(`SKIP: ${test.suiteName} > ${test.testName}`);
        continue;
      }

      try {
        await test.fn();
        console.log(`✓ PASS: ${test.suiteName} > ${test.testName}`);
        passed++;
      } catch (error) {
        console.error(`✗ FAIL: ${test.suiteName} > ${test.testName}`);
        console.error(`  ${(error as Error).message}`);
        failed++;
      }
    }

    const total = passed + failed;
    const summary = `\nResults: ${passed}/${total} passed (${
      Math.round((passed / total) * 100) || 0
    }%)`;
    
    console.log(summary);
    
    return {
      passed,
      failed,
      total,
    };
  };

  return {
    describe,
    test,
    it,
    expect,
    run,
  };
} 