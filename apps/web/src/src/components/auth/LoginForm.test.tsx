/* eslint-disable */import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { LoginForm } from './LoginForm';
import { testAccessibility, generateFormValidationTests } from '@/utils/test-utils';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders login form correctly', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  generateFormValidationTests(<LoginForm onSubmit={mockOnSubmit} />, [
    {
      field: 'Email',
      value: 'invalid-email',
      expectedError: 'Please enter a valid email address',
    },
    {
      field: 'Password',
      value: '123',
      expectedError: 'Password must be at least 8 characters',
    },
  ]);

  it('submits form with valid data', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }});

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      }}});

  it('shows error message on failed login', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Invalid credentials'});
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }});

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    }});

  it('meets accessibility requirements', async () => {
    await testAccessibility(<LoginForm onSubmit={mockOnSubmit} />);
  }});
