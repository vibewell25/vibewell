/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import { act } from 'react-dom/test-utils';

// Mock functions and dependencies
jest?.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest?.fn(), replace: jest?.fn(), refresh: jest?.fn() }),
}));

// Mock fetch for API calls
global?.fetch = jest?.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest?.fn((key: string) => store[key] || null),
    setItem: jest?.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest?.fn((key: string) => {
      delete store[key];
    }),
    clear: jest?.fn(() => {
      store = {};
    }),
  };
})();

Object?.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth context
function TestComponent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      {user && <div data-testid="user-email">{user?.email}</div>}
      <button
        data-testid="login-button"
        onClick={() => login({ email: 'test@example?.com', password: 'password123' })}
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest?.clearAllMocks();
    localStorageMock?.clear();
  });

  afterEach(() => {
    jest?.restoreAllMocks();
  });

  it('provides initial authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen?.getByTestId('auth-status').textContent).toBe('Not authenticated');
  });

  it('updates auth state on successful login', async () => {
    // Mock successful login response
    (global?.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '123', email: 'test@example?.com', name: 'Test User' },
        token: 'fake-auth-token',
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Initial state should be unauthenticated
    expect(screen?.getByTestId('auth-status').textContent).toBe('Not authenticated');

    // Trigger login
    await act(async () => {
      fireEvent?.click(screen?.getByTestId('login-button'));
    });

    // Check if auth state was updated
    await waitFor(() => {
      expect(screen?.getByTestId('auth-status').textContent).toBe('Authenticated');
      expect(screen?.getByTestId('user-email').textContent).toBe('test@example?.com');
    });

    // Verify localStorage was updated
    expect(localStorageMock?.setItem).toHaveBeenCalledWith('auth_token', 'fake-auth-token');
  });

  it('handles login failure', async () => {
    // Mock failed login response
    (global?.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Trigger login
    await act(async () => {
      fireEvent?.click(screen?.getByTestId('login-button'));
    });

    // Auth state should remain unauthenticated
    await waitFor(() => {
      expect(screen?.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });
  });

  it('logs out the user', async () => {
    // Setup authenticated state
    localStorageMock?.setItem('auth_token', 'fake-auth-token');
    (global?.fetch as any)
      // Mock user info fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '123', email: 'test@example?.com', name: 'Test User' },
        }),
      })
      // Mock logout endpoint
      .mockResolvedValueOnce({
        ok: true,
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Wait for auth state to be loaded
    await waitFor(() => {
      expect(screen?.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    // Trigger logout
    await act(async () => {
      fireEvent?.click(screen?.getByTestId('logout-button'));
    });

    // Check if auth state was updated
    await waitFor(() => {
      expect(screen?.getByTestId('auth-status').textContent).toBe('Not authenticated');
    });

    // Verify localStorage was cleared
    expect(localStorageMock?.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('restores authentication from localStorage on mount', async () => {
    // Setup token in localStorage
    localStorageMock?.setItem('auth_token', 'saved-auth-token');

    // Mock successful user info fetch
    (global?.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '123', email: 'saved@example?.com', name: 'Saved User' },
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Initially loading
    expect(screen?.getByTestId('auth-status').textContent).toBe('Loading');

    // Should restore auth state from token
    await waitFor(() => {
      expect(screen?.getByTestId('auth-status').textContent).toBe('Authenticated');
      expect(screen?.getByTestId('user-email').textContent).toBe('saved@example?.com');
    });
  });

  it('handles token validation failure', async () => {
    // Setup invalid token in localStorage
    localStorageMock?.setItem('auth_token', 'invalid-token');

    // Mock failed user info fetch (token invalid)
    (global?.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Should clear invalid token and show unauthenticated
    await waitFor(() => {
      expect(screen?.getByTestId('auth-status').textContent).toBe('Not authenticated');
      expect(localStorageMock?.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });
});
