/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { describe, expect, test, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import * as React from 'react';

// Mock API server
const server = setupServer(
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();

    // Simulate validation errors
    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: 'Email and password are required',
        },
        { status: 400 },
      );
    }

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
    }

    // Simulate authentication failure
    return HttpResponse.json(
      {
        error: 'Invalid email or password',
      },
      { status: 401 },
    );
  }),
);

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Login Page', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('renders login form', async () => {
    render(React.createElement(LoginPage));

    // Check that form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('validates user input', async () => {
    render(React.createElement(LoginPage));

    // Submit with empty fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows error message for invalid credentials', async () => {
    render(React.createElement(LoginPage));

    // Fill in form with invalid credentials
    await act(async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('successfully logs in with valid credentials', async () => {
    render(React.createElement(LoginPage));

    // Fill in form with valid credentials
    await act(async () => {
      userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should save token to localStorage
    await waitFor(() => {
      expect(localStorageMock.getItem('auth_token')).toBe('mock-jwt-token');
    });
  });
});
