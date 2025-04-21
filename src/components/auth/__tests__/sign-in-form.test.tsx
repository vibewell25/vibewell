import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Add the DOM extensions to Jest's expect
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('/dashboard'),
  }),
}));

// Mock auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithProvider: mockSignInWithProvider,
  }),
}));

// Mock UI components to simplify testing
jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-footer" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/icons', () => ({
  Icons: {
    spinner: () => <div data-testid="spinner-icon">Spinner</div>,
    google: () => <div data-testid="google-icon">Google</div>,
    facebook: () => <div data-testid="facebook-icon">Facebook</div>,
    apple: () => <div data-testid="apple-icon">Apple</div>,
  },
}));

// Import the component after all mocks are set up
import { SignInForm } from '@/components/auth/sign-in-form';

// Mock functions need to be defined before they're used in mocks
const mockSignIn = jest.fn();
const mockSignInWithProvider = jest.fn();

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default behavior for successful sign in
    mockSignIn.mockResolvedValue({ success: true });
    mockSignInWithProvider.mockResolvedValue({ success: true });
  });

  test('renders sign in form correctly', () => {
    render(<SignInForm />);

    // Check for form elements
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();

    // Check for social login buttons
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apple/i })).toBeInTheDocument();

    // Check for links
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('validates email and password fields', async () => {
    render(<SignInForm />);

    // Submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('calls signIn with correct credentials on form submission', async () => {
    render(<SignInForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    // Verify signIn was called with correct parameters
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });

  test('displays error message when sign in fails', async () => {
    // Override default behavior for this test
    mockSignIn.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    render(<SignInForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('calls signInWithProvider when social login button is clicked', async () => {
    render(<SignInForm />);

    // Click Google sign in button
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));

    // Verify provider sign in was called
    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
    });
  });

  test('shows loading state while submitting form', async () => {
    // Implementation detail: In the actual component, the button text changes to "Signing in..."
    // instead of showing a spinner icon, so we need to adjust our test

    // Delay the resolution of signIn
    mockSignIn.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<SignInForm />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    // Instead of looking for a spinner icon, check for the button text change
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Signing in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
