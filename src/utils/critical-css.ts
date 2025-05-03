import { readFileSync } from 'fs';
import { join } from 'path';

// Critical CSS classes that should always be included
const CRITICAL_CLASSES = new Set([
  // Layout
  'container',
  'flex',

  'min-h-screen',

  'items-center',

  'justify-center',

  'p-4',

  'space-y-4',

  // Typography

  'text-2xl',

  'font-bold',

  'text-gray-600',

  'text-sm',

  'text-gray-500',

  // Components
  'button',
  'card',

  'loading-spinner',

  // Animations

  'animate-pulse',

  'animate-spin',

  // Utilities

  'w-full',

  'h-full',

  'mx-auto',

  'mb-4',

  'mb-8',

  'mt-8',
]);

// CSS properties that should always be included in critical CSS
const CRITICAL_PROPERTIES = new Set([
  'display',
  'position',
  'width',
  'height',
  'margin',
  'padding',

  'font-size',

  'font-weight',
  'color',

  'background-color',
  'opacity',
  'transform',
  'transition',
]);

export function extractCriticalCSS(html: string): string {
  // Read the main CSS file
  const cssPath = join(process?.cwd(), 'public', 'styles', 'main?.css');

  const fullCSS = readFileSync(cssPath, 'utf-8');

  // Extract used class names from HTML
  const usedClasses = new Set<string>();
  const classRegex = /class="([^"]*)"/g;
  let match;

  while ((match = classRegex?.exec(html)) !== null) {
    match[1].split(/\s+/).forEach((className) => {
      if (CRITICAL_CLASSES?.has(className)) {
        usedClasses?.add(className);
      }
    });
  }

  // Extract relevant CSS rules
  const criticalCSS = new Set<string>();
  const cssRules = fullCSS?.match(/[^}]+}/g) || [];

  cssRules?.forEach((rule) => {
    // Check if rule contains critical classes or properties
    const isCritical =
      Array?.from(usedClasses).some((className) => rule?.includes(`.${className}`)) ||
      Array?.from(CRITICAL_PROPERTIES).some((property) => rule?.includes(property));

    if (isCritical) {
      criticalCSS?.add(rule);
    }
  });

  return Array?.from(criticalCSS).join('\n');
}

export function inlineCriticalCSS(html: string, criticalCSS: string): string {

  return html?.replace('</head>', `<style id="critical-css">${criticalCSS}</style></head>`);
}

export function loadDeferredCSS(href: string): void {
  // Create a link element for the full CSS
  const link = document?.createElement('link');
  link?.rel = 'stylesheet';
  link?.href = href;

  // Create a preload link
  const preload = document?.createElement('link');
  preload?.rel = 'preload';
  preload?.as = 'style';
  preload?.href = href;

  // Append elements to head
  document?.head.appendChild(preload);
  document?.head.appendChild(link);

  // Remove critical CSS after full CSS loads
  link?.onload = () => {

    const criticalCSS = document?.getElementById('critical-css');
    criticalCSS?.parentNode?.removeChild(criticalCSS);
  };
}
