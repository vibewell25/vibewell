/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
// Import type definitions for custom matchers

/**
 * Accessibility Testing Utilities
 * 
 * This module provides comprehensive testing utilities for accessibility requirements
 * including WCAG 2.1 compliance checks, keyboard navigation, screen reader testing,
 * color contrast evaluation, and more.
 */

// Import from our adapter
import { render, screen, fireEvent } from './testing-lib-adapter';
import type { ReactElement } from 'react';

// Import jest-axe for accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';

// Use require for test libraries
const { expect } = require('@jest/globals');

// Extend Jest with custom matchers
expect.extend(toHaveNoViolations);

// Interfaces
export interface AxeOptions {
  rules?: {
    [key: string]: {
      enabled: boolean;
    };
  };
  runOnly?: {
    type: 'tag' | 'rule';
    values: string[];
  };
}

export interface RenderOptions {
  container?: HTMLElement;
  baseElement?: HTMLElement;
  hydrate?: boolean;
  wrapper?: React.ComponentType<any>;
  queries?: any;
}

export interface TestAccessibilityOptions {
  axeOptions?: AxeOptions;
  renderOptions?: RenderOptions;
}

export interface KeyboardNavigationOptions {
  startElement?: HTMLElement;
  tabSequence?: HTMLElement[];
  customKeys?: Array<{
    key: string;
    selector: string;
    expectedAction: () => boolean;
  }>;
}

export interface ScreenReaderOptions {
  announcements?: string[];
  ariaLive?: 'polite' | 'assertive';
  waitForAnnouncement?: boolean;
}

export interface ColorContrastOptions {
  foregroundSelector?: string;
  backgroundSelector?: string;
  minRatio?: number;
}

export interface AriaRoleOptions {
  roles?: AriaRoleTest[];
}

export interface TestElement {
  selector: string;
  expectedRole?: string;
  name?: string;
  description?: string;
}

export interface AriaRoleTest {
  role: string;
  elements: TestElement[];
}

export interface FocusTrapOptions {
  containerSelector: string;
  triggerSelector: string;
  expectedTrappedElements: string[];
}

export interface TouchTargetOptions {
  elements: string[];
  minSize?: number; // px
}

export interface LandmarkTest {
  role: string;
  count: number;
  selector?: string;
}

// Default axe configuration
export const axeConfig: AxeOptions = {
  rules: {
    'color-contrast': { enabled: true },
    'link-in-text-block': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-hidden-focus': { enabled: true }
  }
};

/**
 * Tests a component for accessibility issues using axe
 * 
 * @param ui - The React component to test
 * @param options - Options for testing
 * @returns Promise resolving to the axe results
 */
export async function testAccessibility(
  ui: ReactElement,
  options: TestAccessibilityOptions = {}
): Promise<any> {
  const { axeOptions = axeConfig, renderOptions = {} } = options;
  const container = render(ui, renderOptions).container;
  
  const results = await axe(container, axeOptions);
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Tests keyboard navigation through a component
 * 
 * @param options - Keyboard navigation options
 * @returns Promise resolving when testing completes
 */
export async function testKeyboardNavigation(
  options: KeyboardNavigationOptions = {}
): Promise<void> {
  const { startElement, tabSequence, customKeys = [] } = options;
  
  // Set focus on starting element if provided
  if (startElement) {
    startElement.focus();
  }

  // Test tab sequence if provided
  if (tabSequence && tabSequence.length > 0) {
    let currentElement = document.activeElement;
    
    for (const expectedElement of tabSequence) {
      fireEvent.keyDown(currentElement || document.body, { key: 'Tab' });
      fireEvent.keyUp(currentElement || document.body, { key: 'Tab' });
      
      expect(document.activeElement).toBe(expectedElement);
      currentElement = document.activeElement;
    }
  }

  // Test custom key interactions
  for (const { key, selector, expectedAction } of customKeys) {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }
    
    element.focus();
    fireEvent.keyDown(element, { key });
    fireEvent.keyUp(element, { key });
    
    expect(expectedAction()).toBe(true);
  }
}

/**
 * Tests if screen reader announcements work correctly
 * 
 * @param ui - The React component to test
 * @param options - Screen reader options
 * @returns Promise resolving when testing completes
 */
export async function testScreenReaderAnnouncements(
  ui: ReactElement,
  options: ScreenReaderOptions = {}
): Promise<void> {
  const { announcements = [], ariaLive = 'polite', waitForAnnouncement = true } = options;
  
  // Create an aria-live region for testing
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', ariaLive);
  document.body.appendChild(liveRegion);
  
  try {
    const { rerender } = render(ui);

    // Test each expected announcement
    for (const announcement of announcements) {
      // Trigger the announcement (implementation depends on component)
      liveRegion.textContent = announcement;
      
      if (waitForAnnouncement) {
        // Wait for announcement to be processed
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Check that the announcement is in the DOM and potentially visible to screen readers
      expect(screen.getByText(announcement)).toBeInTheDocument();
      
      rerender(ui);
    }
  } finally {
    // Clean up
    document.body.removeChild(liveRegion);
  }
}

/**
 * Parses an RGB color string into an object
 * 
 * @param rgb - RGB color string
 * @returns Object with r, g, b values
 */
function parseRgb(rgb: string): { r: number, g: number, b: number } {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!match) {
    throw new Error(`Invalid RGB format: ${rgb}`);
  }
  
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
}

/**
 * Converts an sRGB color component to linear RGB
 * 
 * @param color - sRGB color component (0-255)
 * @returns Linear RGB value
 */
function srgbToLinear(color: number): number {
  // Convert 0-255 to 0-1
  const c = color / 255;
  
  // Convert sRGB to linear RGB
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of a color
 * 
 * @param rgb - RGB color object
 * @returns Relative luminance
 */
function getLuminance(rgb: { r: number, g: number, b: number }): number {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  
  // Calculate luminance per WCAG formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors
 * 
 * @param color1 - First color's RGB values
 * @param color2 - Second color's RGB values
 * @returns Contrast ratio
 */
function calculateContrastRatio(color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  // Ensure lighter color is first for the formula
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  // Calculate contrast ratio
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Tests color contrast between elements
 * 
 * @param options - Color contrast options
 * @returns Promise resolving to the contrast ratio
 */
export async function testColorContrast(
  options: ColorContrastOptions = {}
): Promise<number> {
  const { 
    foregroundSelector = 'body', 
    backgroundSelector = 'body', 
    minRatio = 4.5 // WCAG AA standard
  } = options;
  
  const foreground = document.querySelector(foregroundSelector) as HTMLElement;
  const background = document.querySelector(backgroundSelector) as HTMLElement;
  
  if (!foreground || !background) {
    throw new Error('Elements not found for contrast testing');
  }
  
  const foregroundColor = getComputedStyle(foreground).color;
  const backgroundColor = getComputedStyle(background).backgroundColor;
  
  const rgbForeground = parseRgb(foregroundColor);
  const rgbBackground = parseRgb(backgroundColor);
  
  const ratio = calculateContrastRatio(rgbForeground, rgbBackground);
  
  expect(ratio).toBeGreaterThanOrEqual(minRatio);
  return ratio;
}

/**
 * Tests if ARIA roles are correctly applied
 * 
 * @param options - ARIA role options
 * @returns Promise resolving when testing completes
 */
export async function testAriaRoles(
  options: AriaRoleOptions = {}
): Promise<void> {
  const { roles = [] } = options;
  
  for (const roleTest of roles) {
    const { role, elements } = roleTest;
    
    for (const element of elements) {
      const { selector, expectedRole = role, name, description } = element;
      
      const domElement = document.querySelector(selector) as HTMLElement;
      if (!domElement) {
        throw new Error(`Element not found for selector: ${selector}`);
      }
      
      // Test role
      expect(domElement).toHaveAttribute('role', expectedRole);
      
      // Test aria-label or aria-labelledby if name provided
      if (name) {
        expect(
          domElement.hasAttribute('aria-label') || 
          domElement.hasAttribute('aria-labelledby')
        ).toBe(true);
      }
      
      // Test aria-describedby if description provided
      if (description) {
        expect(domElement).toHaveAttribute('aria-describedby');
      }
    }
  }
}

/**
 * Tests if focus is properly trapped in a modal or dialog
 * 
 * @param options - Focus trap options
 * @returns Promise resolving when testing completes
 */
export async function testFocusTrap(
  options: FocusTrapOptions
): Promise<void> {
  const { containerSelector, triggerSelector, expectedTrappedElements } = options;
  
  const trigger = document.querySelector(triggerSelector) as HTMLElement;
  if (!trigger) {
    throw new Error(`Trigger element not found: ${triggerSelector}`);
  }
  
  // Open the modal/dialog
  trigger.click();
  
  // Get the container after opening
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!container) {
    throw new Error(`Container element not found after trigger: ${containerSelector}`);
  }
  
  // Find all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  // Check that expected elements match actual focusable elements
  expect(focusableElements.length).toBe(expectedTrappedElements.length);
  
  // Test tab navigation within the trap
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // Set focus to the last element and press Tab to ensure it wraps to first
  lastElement.focus();
  fireEvent.keyDown(lastElement, { key: 'Tab' });
  expect(document.activeElement).toBe(firstElement);
  
  // Set focus to the first element and press Shift+Tab to ensure it wraps to last
  firstElement.focus();
  fireEvent.keyDown(firstElement, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(lastElement);
}

/**
 * Tests if touch targets meet minimum size requirements
 * 
 * @param options - Touch target options
 * @returns Promise resolving when testing completes
 */
export async function testTouchTargets(
  options: TouchTargetOptions
): Promise<void> {
  const { elements, minSize = 44 } = options; // WCAG recommends 44x44px minimum
  
  for (const selector of elements) {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found for selector: ${selector}`);
    }
    
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    expect(width).toBeGreaterThanOrEqual(minSize);
    expect(height).toBeGreaterThanOrEqual(minSize);
  }
}

/**
 * Tests if landmarks are properly defined
 * 
 * @param landmarks - Array of landmark tests
 * @returns Promise resolving when testing completes
 */
export async function testLandmarks(
  landmarks: LandmarkTest[]
): Promise<void> {
  for (const { role, count, selector } of landmarks) {
    const query = selector || `[role="${role}"]`;
    const elements = document.querySelectorAll(query);
    
    expect(elements.length).toBe(count);
  }
}

/**
 * Tests heading hierarchy (no skipped levels)
 * 
 * @returns Promise resolving when testing completes
 */
export async function testHeadingHierarchy(): Promise<void> {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));
  
  let prevLevel = 0;
  
  for (const level of headingLevels) {
    // Heading level should not jump by more than one
    expect(level - prevLevel).toBeLessThanOrEqual(1);
    prevLevel = level;
  }
}

/**
 * Tests for image accessibility
 * 
 * @returns Promise resolving when testing completes
 */
export async function testImageAccessibility(): Promise<void> {
  const images = document.querySelectorAll('img');
  
  for (const img of Array.from(images)) {
    // All images should have alt attributes
    expect(img).toHaveAttribute('alt');
    
    // Decorative images should have empty alt text
    if (img.getAttribute('role') === 'presentation') {
      expect(img.getAttribute('alt')).toBe('');
    }
  }
}

// Export all testing functions
const accessibilityTesting = {
  testAccessibility,
  testKeyboardNavigation,
  testScreenReaderAnnouncements,
  testColorContrast,
  testAriaRoles,
  testFocusTrap,
  testTouchTargets,
  testLandmarks,
  testHeadingHierarchy,
  testImageAccessibility
};

export default accessibilityTesting; 