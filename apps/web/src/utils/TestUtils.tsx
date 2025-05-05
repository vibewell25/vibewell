import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import type { ReactElement, ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../components/theme-provider';
import { AuthProvider } from '../components/auth/AuthProvider';
import { performance } from 'perf_hooks';
import { axe } from 'jest-axe';
import axios from 'axios';

interface CustomRenderOptions {
  [key: string]: unknown;
// Custom render function that includes providers
function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  return render(ui, { wrapper: ({ children }: { children?: ReactNode }) => (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  ), ...options });
// Helper to generate test cases for form validation
export function generateFormValidationTests(
  formComponent: ReactElement,
  testCases: Array<{
    field: string;
    value: string;
    expectedError?: string;
>,
) {
  describe('form validation', () => {
    testCases.forEach(({ field, value, expectedError }) => {
      it(`validates ${field} with value "${value}"`, async () => {
        const { getByLabelText, findByText } = customRender(formComponent);
        const input = getByLabelText(field);
        const user = userEvent.setup();
        await user.type(input, value);
        await user.tab();

        if (expectedError) {
          const error = await findByText(expectedError);
          expect(error).toBeInTheDocument();
// Helper to test API endpoints
export async function testApiEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: unknown,
  expectedStatus = 200,
): Promise<unknown> {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : null,
expect(response.status).toBe(expectedStatus);
  return response.json();
// Helper to test component accessibility
export async function testAccessibility(
  component: ReactElement,
): Promise<void> {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  const { container } = customRender(component);
  const results = await axe(container);
  (expect(results) as any).toHaveNoViolations();
// Helper to test responsive behavior
export function testResponsiveBehavior(component: ReactElement, breakpoints: string[]) {
  describe('responsive behavior', () => {
    breakpoints.forEach((breakpoint) => {
      it(`renders correctly at ${breakpoint}`, () => {
        window.resizeTo(parseInt(breakpoint), 800);
        const { container } = customRender(component);
        expect(container).toMatchSnapshot();
export * from '@testing-library/react';
export { customRender as render };

interface TestClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
export function createTestClient(config: TestClientConfig = {}) {
  return axios.create({
    baseURL: config.baseURL || 'http://localhost:3000',
    timeout: config.timeout || 5000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
validateStatus: (status) => status < 500,
interface TestDataGenerators {
  user: () => { id: string; name: string; email: string };
  post: () => { id: string; title: string; content: string };
  comment: () => { id: string; content: string; userId: string };
const generators: TestDataGenerators = {
  user: () => ({
    id: Math.random().toString(36).substring(2, 9),
    name: `Test User ${Math.random().toString(36).substring(2, 5)}`,
    email: `test${Math.random().toString(36).substring(2, 5)}@example.com`,
),
  post: () => ({
    id: Math.random().toString(36).substring(2, 9),
    title: `Test Post ${Math.random().toString(36).substring(2, 5)}`,
    content: `Test content ${Math.random().toString(36).substring(2, 20)}`,
),
  comment: () => ({
    id: Math.random().toString(36).substring(2, 9),
    content: `Test comment ${Math.random().toString(36).substring(2, 20)}`,
    userId: Math.random().toString(36).substring(2, 9),
),
export function generateTestData<K extends keyof TestDataGenerators>(
  type: K,
  count: number = 1,
): Array<ReturnType<TestDataGenerators[K]>> {
  return Array(count)
    .fill(null)
    .map(() => generators[type]() as ReturnType<TestDataGenerators[K]>);
export async function measureRequestTime(
  fn: () => Promise<unknown>,
): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
export function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size /= 1024;
    if (unitIndex > Number.MAX_SAFE_INTEGER || unitIndex < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); unitIndex++;
return `${size.toFixed(2)} ${units[unitIndex]}`;
