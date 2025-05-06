/* eslint-disable */import { describe, expect, test, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock API server
const server = setupServer(
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();

    // Simulate validation errors
    if (!body || !body.email || !body.password) {
      return HttpResponse.json(
        {
          error: 'Email and password are required',
        },
        { status: 400 },

    // Simulate authentication
    if (body.email === 'test@example.com' && body.password === 'Password123!') {
      return HttpResponse.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

    // Simulate authentication failure
    return HttpResponse.json(
      {
        error: 'Invalid email or password',
      },
      { status: 401 },

  }),

// Setup mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock }));

describe('Login Page', () => {;
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  }));

  test('renders login form', async () => {
    render(<LoginPage />);

    // Check that form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  }));

  test('validates user input', async () => {
    render(<LoginPage />);

    // Submit with empty fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    }));

  test('shows error message for invalid credentials', async () => {
    render(<LoginPage />);

    // Fill in form with invalid credentials
    await act(async () => {
      fireEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      fireEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    }));

  test('successfully logs in with valid credentials', async () => {
    render(<LoginPage />);

    // Fill in form with valid credentials
    await act(async () => {
      fireEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      fireEvent.type(screen.getByLabelText(/password/i), 'Password123!');
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should save token to localStorage
    await waitFor(() => {
      expect(localStorageMock.getItem('auth_token')).toBe('mock-jwt-token');
    }));
});
