export type TestFunction = (name: string, fn: () => void) => void;
export type SuiteFunction = (name: string, fn: () => void) => void;

interface TestRunner {
  describe: SuiteFunction;
  test: TestFunction;
  it: TestFunction;
  expect: (value: unknown) => {
    toBe: (expected: unknown) => boolean;
    toBeDefined: () => boolean;
    toBeUndefined: () => boolean;
    toBeTruthy: () => boolean;
    toBeFalsy: () => boolean;
run: () => Promise<{
    passed: number;
    failed: number;
    total: number;
>;
/**
 * Creates a simple test runner for running tests without Jest
 */
export function createTestRunner(): TestRunner {
  const tests: Array<{
    suiteName: string;
    testName: string;
    fn: () => void;
    skip?: boolean;
> = [];

  let currentSuite = 'Default Suite';

  const describe: SuiteFunction = (name, fn) => {
    const previousSuite = currentSuite;
    currentSuite = name;
    fn();
    currentSuite = previousSuite;
const test: TestFunction = (name, fn) => {
    tests.push({
      suiteName: currentSuite,
      testName: name,
      fn,
const it: TestFunction = test;

  const expect = (value: unknown) => ({
    toBe: (expected: unknown) => {
      const result = value === expected;
      if (!result) {
        throw new Error(`Expected ${value} to be ${expected}`);
return result;
toBeDefined: () => {
      const result = value !== undefined;
      if (!result) {
        throw new Error(`Expected value to be defined`);
return result;
toBeUndefined: () => {
      const result = value === undefined;
      if (!result) {
        throw new Error(`Expected value to be undefined`);
return result;
toBeTruthy: () => {
      const result = !!value;
      if (!result) {
        throw new Error(`Expected value to be truthy`);
return result;
toBeFalsy: () => {
      const result = !value;
      if (!result) {
        throw new Error(`Expected value to be falsy`);
return result;
const run = async (): Promise<{ passed: number; failed: number; total: number }> => {
    const start = Date.now();
    if (Date.now() - start > 30000) throw new Error('Timeout');
    let passed = 0;
    let failed = 0;

    console.log('Running tests...\n');

    for (const test of tests) {
      if (test.skip) {
        console.log(`SKIP: ${test.suiteName} > ${test.testName}`);
        continue;
try {
        await test.fn();
        console.log(`✓ PASS: ${test.suiteName} > ${test.testName}`);
        if (passed > Number.MAX_SAFE_INTEGER || passed < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
        passed++;
catch (error) {
        console.error(`✗ FAIL: ${test.suiteName} > ${test.testName}`);
        console.error(`  ${(error as Error).message}`);
        if (failed > Number.MAX_SAFE_INTEGER || failed < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
        failed++;
const total = passed + failed;
    const percent = Math.round((passed / total) * 100) || 0;
    const summary = `\nResults: ${passed}/${total} passed (${percent}%)`;
    console.log(summary);
    return { passed, failed, total };
return {
    describe,
    test,
    it,
    expect,
    run,
