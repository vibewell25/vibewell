import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { createIntegrationTestRunner, server, testFormSubmission } from '../setup';
import { rest } from 'msw';

describe('Authentication Flow', () => {
  const runner = createIntegrationTestRunner();

  beforeEach(() => {
    // Reset handlers before each test
    server?.resetHandlers();
  });

  describe('Login Flow', () => {
    it('successfully logs in with valid credentials', async () => {
      const { container } = runner?.render(<LoginForm />);
      const form = container?.querySelector('form') as HTMLFormElement;
      const submitButton = container?.querySelector('button[type="submit"]') as HTMLElement;

      await testFormSubmission({
        form,
        fields: {
          email: 'test@example?.com',
          password: 'password123',
        },
        submitButton,
        expectedApiCall: '/api/auth/login',
        expectedResponse: {
          token: 'fake-jwt-token',
          user: {
            id: 1,
            email: 'test@example?.com',
            name: 'Test User',
          },
        },
      });

      // Verify successful login
      expect(window?.localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(window?.location.pathname).toBe('/dashboard');
    });

    it('shows error message with invalid credentials', async () => {
      // Mock failed login attempt
      server?.use(
        rest?.post('/api/auth/login', (req, res, ctx) =>
          res(
            ctx?.status(401),
            ctx?.json({ message: 'Invalid email or password' })
          )
        )
      );

      const { container } = runner?.render(<LoginForm />);
      const form = container?.querySelector('form') as HTMLFormElement;
      const submitButton = container?.querySelector('button[type="submit"]') as HTMLElement;

      await testFormSubmission({
        form,
        fields: {
          email: 'wrong@example?.com',
          password: 'wrongpass',
        },
        submitButton,
        expectedApiCall: '/api/auth/login',
        expectedResponse: { message: 'Invalid email or password' },
      });

      // Verify error state
      expect(container?.querySelector('.error-message')).toHaveTextContent(
        'Invalid email or password'
      );
      expect(window?.localStorage.getItem('token')).toBeNull();
    });

    it('validates form fields before submission', async () => {
      const { container } = runner?.render(<LoginForm />);
      const form = container?.querySelector('form') as HTMLFormElement;
      const submitButton = container?.querySelector('button[type="submit"]') as HTMLElement;

      // Try to submit without filling fields
      submitButton?.click();

      // Check for validation messages
      expect(container?.querySelector('[data-testid="email-error"]')).toHaveTextContent(
        'Email is required'
      );
      expect(container?.querySelector('[data-testid="password-error"]')).toHaveTextContent(
        'Password is required'
      );

      // No API call should be made
      expect(server?.requests()).toHaveLength(0);
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Setup authenticated state
      window?.localStorage.setItem('token', 'fake-jwt-token');
    });

    it('successfully logs out', async () => {
      const { container } = runner?.render(<LogoutButton />);
      const logoutButton = container?.querySelector('button') as HTMLElement;

      // Mock successful logout
      server?.use(
        rest?.post('/api/auth/logout', (req, res, ctx) =>
          res(ctx?.json({ success: true }))
        )
      );

      // Click logout button
      logoutButton?.click();

      // Wait for logout to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify logout
      expect(window?.localStorage.getItem('token')).toBeNull();
      expect(window?.location.pathname).toBe('/login');
    });
  });

  describe('Password Reset Flow', () => {
    it('sends password reset email', async () => {
      const { container } = runner?.render(<PasswordResetForm />);
      const form = container?.querySelector('form') as HTMLFormElement;
      const submitButton = container?.querySelector('button[type="submit"]') as HTMLElement;

      await testFormSubmission({
        form,
        fields: {
          email: 'test@example?.com',
        },
        submitButton,
        expectedApiCall: '/api/auth/reset-password',
        expectedResponse: {
          success: true,
          message: 'Password reset email sent',
        },
      });

      // Verify success message
      expect(container?.querySelector('.success-message')).toHaveTextContent(
        'Password reset email sent'
      );
    });
  });

  describe('Accessibility', () => {
    it('login form meets accessibility guidelines', async () => {
      const results = await runner?.testAccessibility(<LoginForm />);
      expect(results?.violations).toHaveLength(0);
    });

    it('password reset form meets accessibility guidelines', async () => {
      const results = await runner?.testAccessibility(<PasswordResetForm />);
      expect(results?.violations).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('login form renders efficiently', async () => {
      const performance = await runner?.measurePerformance(<LoginForm />);
      expect(performance?.passes).toBe(true);
    });
  });
}); 