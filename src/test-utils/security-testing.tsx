// @ts-nocheck
/**
 * Security Testing Utilities
 *
 * This module provides utilities for testing security aspects of the application,
 * including XSS protection, CSRF protection, and authentication/authorization.
 */

import React from 'react';
import { render, screen, waitFor } from './testing-lib-adapter';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

/**
 * Common XSS attack vectors to test against
 */
export const XSS_VECTORS = [
  '<script>alert("XSS")</script>',
  '"><script>alert("XSS")</script>',
  '<img src="x" onerror="alert(\'XSS\')">',
  '<svg onload="alert(\'XSS\')">',
  'javascript:alert("XSS")',
  '<a href="javascript:alert(\'XSS\')">Click me</a>',
];

/**
 * Test component for XSS vulnerabilities
 * @param Component - The component to test
 * @param propName - The name of the prop to inject XSS vectors into
 * @param options - Additional test options
 */
export function testXSSVulnerabilities(
  Component: React.ComponentType<any>,
  propName: string,
  options: {
    additionalVectors?: string[];
    renderOptions?: Record<string, any>;
    checkFunction?: (container: HTMLElement) => boolean;
  } = {}
): void {
  const { additionalVectors = [], renderOptions = {}, checkFunction } = options;
  const vectors = [...XSS_VECTORS, ...additionalVectors];

  describe('XSS Security Testing', () => {
    vectors.forEach(vector => {
      it(`should sanitize potential XSS vector: ${vector.substring(0, 20)}...`, () => {
        const props = { [propName]: vector };
        const { container } = render(<Component {...props} />, renderOptions);

        // Check that the script wasn't executed (if a custom check function isn't provided)
        if (checkFunction) {
          expect(checkFunction(container)).toBe(false);
        } else {
          // Default checks
          // 1. No script tags should be rendered
          expect(container.querySelector('script')).toBeNull();

          // 2. No inline event handlers should be rendered
          const html = container.innerHTML;
          expect(html).not.toMatch(/onerror=/i);
          expect(html).not.toMatch(/onload=/i);

          // 3. No javascript: URLs should be rendered
          const links = container.querySelectorAll('a');
          links.forEach(link => {
            expect(link.href).not.toMatch(/^javascript:/i);
          });
        }
      });
    });
  });
}

/**
 * Common SQL injection attack vectors to test against
 */
export const SQL_INJECTION_VECTORS = [
  "' OR '1'='1",
  "1'; DROP TABLE users; --",
  "1' UNION SELECT username, password FROM users; --",
  "'; EXEC xp_cmdshell('dir'); --",
  "admin'--",
  "1' OR '1' = '1' LIMIT 1; --",
];

/**
 * Test an API function for SQL injection vulnerabilities
 * @param apiFn - The API function to test
 * @param paramName - The name of the parameter to inject SQL vectors into
 * @param options - Additional test options
 */
export function testSQLInjectionVulnerabilities(
  apiFn: (params: any) => Promise<any>,
  paramName: string,
  options: {
    additionalVectors?: string[];
    baseParams?: Record<string, any>;
    expectError?: boolean;
  } = {}
): void {
  const { additionalVectors = [], baseParams = {}, expectError = true } = options;
  const vectors = [...SQL_INJECTION_VECTORS, ...additionalVectors];

  describe('SQL Injection Security Testing', () => {
    vectors.forEach(vector => {
      it(`should handle SQL injection vector: ${vector.substring(0, 20)}...`, async () => {
        const params = { ...baseParams, [paramName]: vector };

        if (expectError) {
          // The API should reject the request or throw an error when SQL injection is attempted
          await expect(apiFn(params)).rejects.toThrow();
        } else {
          // The API should sanitize the input and not return sensitive data
          const result = await apiFn(params);
          expect(result).not.toContain('password');
          expect(result).not.toContain('credit_card');
          expect(result).not.toContain('ssn');
        }
      });
    });
  });
}

/**
 * Define common permission levels for authorization testing
 */
export enum PermissionLevel {
  NONE = 'none',
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  OWNER = 'owner',
}

/**
 * Authorization test case configuration
 */
export interface AuthorizationTestCase {
  permissionLevel: PermissionLevel | string;
  shouldAllow: boolean;
  action: () => Promise<any>;
}

/**
 * Test authorization requirements for a component or API
 * @param testCases - Authorization test cases
 * @param options - Additional test options
 */
export function testAuthorization(
  testCases: AuthorizationTestCase[],
  options: {
    setupAuth?: (permissionLevel: PermissionLevel | string) => Promise<void>;
    teardownAuth?: () => Promise<void>;
  } = {}
): void {
  const { setupAuth, teardownAuth } = options;

  describe('Authorization Security Testing', () => {
    testCases.forEach(({ permissionLevel, shouldAllow, action }) => {
      it(`should ${shouldAllow ? 'allow' : 'deny'} access to users with ${permissionLevel} permission`, async () => {
        // Setup auth state for this test case
        if (setupAuth) {
          await setupAuth(permissionLevel);
        }

        try {
          if (shouldAllow) {
            // Should complete successfully
            await expect(action()).resolves.not.toThrow();
          } else {
            // Should throw an authorization error
            await expect(action()).rejects.toThrow();
          }
        } finally {
          // Tear down auth state
          if (teardownAuth) {
            await teardownAuth();
          }
        }
      });
    });
  });
}

/**
 * Test that authentication is required for a component or route
 * @param Component - The component to test
 * @param options - Test options
 */
export function testAuthenticationRequired(
  Component: React.ComponentType<any>,
  options: {
    mockAuthState?: { isAuthenticated: boolean };
    redirectPath?: string;
    renderOptions?: Record<string, any>;
  } = {}
): void {
  const {
    mockAuthState = { isAuthenticated: false },
    redirectPath = '/login',
    renderOptions = {},
  } = options;

  describe('Authentication Security Testing', () => {
    it('should require authentication', () => {
      // Mock any auth-related hooks or contexts
      jest.spyOn(global, 'window', 'get').mockImplementation(() => ({
        ...window,
        location: {
          ...window.location,
          pathname: '',
          replace: jest.fn(),
        },
      }));

      render(<Component />, {
        ...renderOptions,
        // Add any authentication context providers here
      });

      // Check that unauthenticated users are redirected
      expect(window.location.replace).toHaveBeenCalledWith(expect.stringContaining(redirectPath));
    });
  });
}

/**
 * Test a component for sensitive data leakage in HTML
 * @param Component - The component to test
 * @param options - Test options
 */
export function testSensitiveDataLeakage(
  Component: React.ComponentType<any>,
  options: {
    props?: Record<string, any>;
    sensitiveData?: string[];
    renderOptions?: Record<string, any>;
  } = {}
): void {
  const {
    props = {},
    sensitiveData = ['password', 'token', 'secret', 'apiKey', 'credit', 'ssn'],
    renderOptions = {},
  } = options;

  describe('Sensitive Data Leakage Testing', () => {
    it('should not expose sensitive data in HTML', () => {
      const { container } = render(<Component {...props} />, renderOptions);

      const html = container.innerHTML.toLowerCase();

      // Check for sensitive data leakage
      sensitiveData.forEach(term => {
        expect(html).not.toContain(term.toLowerCase());
      });

      // Check for common sensitive data patterns
      expect(html).not.toMatch(/[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}/); // Credit card
      expect(html).not.toMatch(/[0-9]{3}[- ]?[0-9]{2}[- ]?[0-9]{4}/); // SSN
    });
  });
}

/**
 * Test CSRF protection on a form
 * @param formComponent - The form component to test
 * @param submitAction - The action to perform to submit the form
 * @param options - Additional test options
 */
export function testCSRFProtection(
  formComponent: React.ReactElement,
  submitAction: () => void,
  options: {
    csrfTokenSelector?: string;
    mockFetch?: boolean;
  } = {}
): void {
  const { csrfTokenSelector = 'input[name="csrf_token"]', mockFetch = true } = options;

  describe('CSRF Protection Testing', () => {
    it('should include CSRF token in forms', () => {
      const { container } = render(formComponent);

      // Check for CSRF token in the form
      const csrfToken = container.querySelector(csrfTokenSelector);
      expect(csrfToken).not.toBeNull();
    });

    if (mockFetch) {
      it('should send CSRF token with form submission', async () => {
        // Mock fetch to capture request headers
        const originalFetch = global.fetch;
        const mockFetchFn = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({}),
        });
        global.fetch = mockFetchFn;

        try {
          const { container } = render(formComponent);

          // Submit the form
          submitAction();

          // Check that the fetch call included the CSRF token
          expect(mockFetchFn).toHaveBeenCalled();
          const fetchCall = mockFetchFn.mock.calls[0];
          const [url, options] = fetchCall;

          // CSRF token should be in headers, body, or URL depending on implementation
          const hasCSRFToken =
            (options.headers &&
              (options.headers['X-CSRF-Token'] ||
                options.headers['csrf-token'] ||
                options.headers['x-csrf-token'])) ||
            (options.body && options.body.includes('csrf_token')) ||
            url.includes('csrf_token');

          expect(hasCSRFToken).toBe(true);
        } finally {
          // Restore original fetch
          global.fetch = originalFetch;
        }
      });
    }
  });
}

/**
 * Export a helper function to check for secure headers in the response
 * This can be used in API tests to verify security headers
 * @param response - The fetch response to check
 * @param expectedHeaders - The headers that should be present
 */
export function checkSecurityHeaders(
  response: Response,
  expectedHeaders: Record<string, string | RegExp> = {
    'Content-Security-Policy': /.+/,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': /(DENY|SAMEORIGIN)/,
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': /.+/,
  }
): void {
  Object.entries(expectedHeaders).forEach(([header, expected]) => {
    const value = response.headers.get(header);
    if (expected instanceof RegExp) {
      expect(value).toMatch(expected);
    } else {
      expect(value).toBe(expected);
    }
  });
}

/**
 * Test that a component redirects after an authentication failure
 *
 * @param Component The component to test
 * @param props Props to pass to the component
 * @param expectedRedirectPath The expected path to redirect to
 * @param renderOptions Additional options for render
 */
export function testRedirectAfterAuthFailure<P>(
  Component: React.ComponentType<P>,
  props: P,
  expectedRedirectPath: string,
  renderOptions = {}
): void {
  describe('Redirect after auth failure', () => {
    let originalLocation: Location;
    let locationMock: jest.Mock;

    beforeEach(() => {
      originalLocation = window.location;
      locationMock = jest.fn();

      // Mock the window location
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          pathname: '/',
          replace: jest.fn(),
        },
        writable: true,
      });

      // Mock the auth error response
      // @ts-expect-error - Ignore strict window type checking
      jest.spyOn(global, 'window', 'get').mockImplementation(() => {
        // Create a partial window mock with just the properties we need
        const windowMock = {
          location: {
            pathname: '/',
            replace: jest.fn(),
            // Add other required location properties
            href: 'http://localhost:3000/',
            origin: 'http://localhost:3000',
            host: 'localhost:3000',
            hostname: 'localhost',
            hash: '',
            search: '',
            port: '',
            protocol: 'http:',
            reload: jest.fn(),
            assign: jest.fn(),
            toString: jest.fn().mockReturnValue('http://localhost:3000/'),
          },
          // Add other required window properties as needed
        };
        // Cast as any to avoid TypeScript errors with partial implementation
        return windowMock as any;
      });
    });

    afterEach(() => {
      // Restore original window
      jest.restoreAllMocks();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
        writable: true,
      });
    });

    it(`redirects to ${expectedRedirectPath} after authentication failure`, () => {
      render(React.createElement(Component, props), renderOptions);

      // Assert redirection happened
      expect(window.location.replace).toHaveBeenCalledWith(expectedRedirectPath);
    });
  });
}
