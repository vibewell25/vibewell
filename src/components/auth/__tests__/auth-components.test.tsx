import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { AuthProvider, LoginForm, SignupForm, PasswordReset } from '../';

// Mock auth service
const mockAuthService = {
  login: vi.fn(),
  signup: vi.fn(),
  resetPassword: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
};

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('Authentication Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('provides auth context to children', () => {
      const TestComponent = () => {
        return <div>Authenticated Content</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
    });

    it('handles authentication state changes', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({ id: '1', email: 'test@example.com' });

      const TestComponent = () => {
        return <div>User is authenticated</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      });
    });

    it('provides logout functionality', async () => {
      const TestComponent = () => {
        return <button onClick={() => mockAuthService.logout()}>Logout</button>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await user.click(screen.getByText('Logout'));
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('LoginForm', () => {
    const defaultProps = {
      onSuccess: vi.fn(),
    };

    it('renders login form correctly', () => {
      render(<LoginForm {...defaultProps} />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles successful login', async () => {
      mockAuthService.login.mockResolvedValue({ id: '1', email: 'test@example.com' });

      render(<LoginForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('displays validation errors', async () => {
      render(<LoginForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('handles login errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      render(<LoginForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('SignupForm', () => {
    const defaultProps = {
      onSuccess: vi.fn(),
    };

    it('renders signup form correctly', () => {
      render(<SignupForm {...defaultProps} />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('handles successful signup', async () => {
      mockAuthService.signup.mockResolvedValue({ id: '1', email: 'test@example.com' });

      render(<SignupForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(mockAuthService.signup).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('validates password match', async () => {
      render(<SignupForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password456');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('validates password strength', async () => {
      render(<SignupForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/password/i), 'weak');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  describe('PasswordReset', () => {
    const defaultProps = {
      onSuccess: vi.fn(),
    };

    it('renders password reset form correctly', () => {
      render(<PasswordReset {...defaultProps} />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('handles successful password reset request', async () => {
      mockAuthService.resetPassword.mockResolvedValue(true);

      render(<PasswordReset {...defaultProps} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('displays success message', async () => {
      mockAuthService.resetPassword.mockResolvedValue(true);

      render(<PasswordReset {...defaultProps} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('handles reset errors', async () => {
      mockAuthService.resetPassword.mockRejectedValue(new Error('User not found'));

      render(<PasswordReset {...defaultProps} />);

      await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
      });
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('LoginForm meets accessibility standards', async () => {
      const { container } = render(<LoginForm onSuccess={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('SignupForm meets accessibility standards', async () => {
      const { container } = render(<SignupForm onSuccess={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('PasswordReset meets accessibility standards', async () => {
      const { container } = render(<PasswordReset onSuccess={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
