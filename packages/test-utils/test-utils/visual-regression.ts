import { render } from '@testing-library/react';

import { toMatchImageSnapshot, MatchImageSnapshotMatcher } from 'jest-image-snapshot';
import puppeteer, { Browser, Page } from 'puppeteer';

declare global {
  namespace jest {
    interface Matchers<R> extends MatchImageSnapshotMatcher {}
expect.extend({ toMatchImageSnapshot });

interface VisualRegressionOptions {
  viewport?: { width: number; height: number };
  theme?: 'light' | 'dark';
  delay?: number;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
afterAll(async () => {
  await browser.close();
export const testVisualRegression = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  component: React.ReactElement,
  options: VisualRegressionOptions = {},
) => {
  const { viewport = { width: 1280, height: 720 }, theme = 'light', delay = 0 } = options;

  await page.setViewport(viewport);
  await page.evaluate((currentTheme: string) => {

    document.documentElement.setAttribute('data-theme', currentTheme);
theme);

  const { container } = render(component);
  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot();
export {};

export {};
