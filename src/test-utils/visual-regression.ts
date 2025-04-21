import { render } from '@testing-library/react';
import { toMatchImageSnapshot, MatchImageSnapshotMatcher } from 'jest-image-snapshot';
import puppeteer, { Browser, Page } from 'puppeteer';

declare global {
  namespace jest {
    interface Matchers<R> extends MatchImageSnapshotMatcher {}
  }
}

expect.extend({ toMatchImageSnapshot });

interface VisualRegressionOptions {
  viewport?: { width: number; height: number };
  theme?: 'light' | 'dark';
  delay?: number;
}

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

afterAll(async () => {
  await browser.close();
});

export const testVisualRegression = async (
  component: React.ReactElement,
  options: VisualRegressionOptions = {}
) => {
  const { viewport = { width: 1280, height: 720 }, theme = 'light', delay = 0 } = options;

  await page.setViewport(viewport);
  await page.evaluate((currentTheme: string) => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, theme);

  const { container } = render(component);
  if (delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot();
};

export const testResponsiveVisualRegression = async (
  component: React.ReactElement,
  options: Omit<VisualRegressionOptions, 'viewport'> = {}
) => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
  };

  for (const [device, viewport] of Object.entries(viewports)) {
    await testVisualRegression(component, { ...options, viewport });
  }
};

export const testThemeVisualRegression = async (
  component: React.ReactElement,
  options: Omit<VisualRegressionOptions, 'theme'> = {}
) => {
  await testVisualRegression(component, { ...options, theme: 'light' });
  await testVisualRegression(component, { ...options, theme: 'dark' });
};
