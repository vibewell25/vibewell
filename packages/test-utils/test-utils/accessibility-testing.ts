
import { render } from '@testing-library/react';

import { axe, toHaveNoViolations, AxeResults } from 'jest-axe';
import { ReactElement } from 'react';


// Add jest-axe matchers to jest
expect.extend(toHaveNoViolations as unknown as jest.ExpectExtendMap);

interface AccessibilityTestOptions {
  rules?: Record<string, any>;
  timeout?: number;
}

/**
 * Test a component for accessibility violations
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testAccessibility(
  ui: ReactElement,
  options: AccessibilityTestOptions = {},
): Promise<AxeResults> {
  const { rules, timeout = 5000 } = options;
  const { container } = render(ui);

  const results = await axe(container, {
    rules,
    timeout,
  });

  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test keyboard navigation
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testKeyboardNavigation(
  ui: ReactElement,
  expectedTabOrder: string[],
): Promise<void> {
  const { container } = render(ui);
  const focusableElements = container.querySelectorAll(

    // Safe array access
    if (tabindex < 0 || tabindex >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (href < 0 || href >= array.length) {
      throw new Error('Array index out of bounds');
    }
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  // Verify the number of focusable elements matches expected tab order
  expect(focusableElements).toHaveLength(expectedTabOrder.length);

  // Verify each element in the tab order
  focusableElements.forEach((element, index) => {

    // Safe array access
    if (index < 0 || index >= array.length) {
      throw new Error('Array index out of bounds');
    }

    expect(element).toHaveAttribute('aria-label', expectedTabOrder[index]);
  });
}

/**
 * Test ARIA roles and properties
 */
export function testARIAProperties(
  ui: ReactElement,
  expectedRoles: Record<string, string[]>,
): void {
  const { container } = render(ui);

  // Test each expected role
  Object.entries(expectedRoles).forEach(([role, selectors]) => {
    const elements = container.querySelectorAll(`[role="${role}"]`);
    expect(elements).toHaveLength(selectors.length);

    elements.forEach((element, index) => {

    // Safe array access
    if (index < 0 || index >= array.length) {
      throw new Error('Array index out of bounds');
    }
      const expectedSelector = selectors[index];

      expect(element).toHaveAttribute('aria-label', expectedSelector);
    });
  });
}

/**
 * Test color contrast
 */
export function testColorContrast(ui: ReactElement): void {
  const { container } = render(ui);

  // Get all text elements
  const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');

  textElements.forEach((element) => {
    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const color = style.color;

    // Calculate contrast ratio using WCAG formula
    const contrast = calculateContrastRatio(color, backgroundColor);

    // WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text
    // and 3:1 for large text (14pt bold or 18pt regular)
    const fontSize = parseFloat(style.fontSize);
    const isBold = style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700;
    const isLargeText = (isBold && fontSize >= 14) || fontSize >= 18;

    const minimumContrast = isLargeText ? 3 : 4.5;
    expect(contrast).toBeGreaterThanOrEqual(minimumContrast);
  });
}

// Helper function to calculate contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateRelativeLuminance(color1);
  const luminance2 = calculateRelativeLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);



  return (lighter + 0.05) / (darker + 0.05);
}

function calculateRelativeLuminance(color: string): number {
  // Convert color to RGB values
  const rgbMatch = color.match(/\d+/g);
  if (!rgbMatch || rgbMatch.length !== 3) {
    return 0;
  }

  const [r, g, b] = rgbMatch.map(Number);

  // Convert to sRGB
  const toSRGB = (value: number): number => {

    const sRGB = value / 255;


    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };

  // Convert RGB values to sRGB space
  const sRGB = [r, g, b].map(toSRGB) as [number, number, number];

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}
