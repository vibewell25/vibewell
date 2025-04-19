import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../auth-context';
import { useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: vi.fn(),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Test component that uses the auth context
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <button 
        data-testid="signin-btn" 
        onClick={() => auth.signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button 
        data-testid="signout-btn" 
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
      <button 
        data-testid="signup-btn" 
        onClick={() => auth.signUp('test@example.com', 'password', 'Test User')}
      >
        Sign Up
      </button>
      <button 
        data-testid="reset-btn" 
        onClick={() => auth.resetPassword('test@example.com')}
      >
        Reset Password
      </button>
      <button 
        data-testid="update-password-btn" 
        onClick={() => auth.updatePassword('newpassword')}
      >
        Update Password
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockRouter = { 
    push: vi.fn(), 
    replace: vi.fn() 
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    
    // Setup default behavior for Auth0 mock
    (useUser as any).mockReturnValue({
      user: null,
      error: null,
      isLoading: false
    });
    
    // Setup fetch mock
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should provide loading state initially', async () => {
    // Mock Auth0 loading state
    (useUser as any).mockReturnValue({
      user: null,
      error: null,
      isLoading: true
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Update mock to finished loading
    (useUser as any).mockReturnValue({
      user: null,
      error: null,
      isLoading: false
    });
    
    // Loading should become false after auth initialization
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('should handle sign in correctly', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('signin-btn'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
    expect(mockRouter.push).toHaveBeenCalledWith('/api/auth/login');
  });

  it('should handle sign in error', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('signin-btn'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle sign up correctly', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('signup-btn'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', expect.any(Object));
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/verify-email');
  });

  it('should handle sign out correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('signout-btn'));
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/api/auth/logout');
  });

  it('should handle reset password correctly', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('reset-btn'));
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/password-reset', expect.any(Object));
  });
}); 