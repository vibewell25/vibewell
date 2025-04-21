/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/auth-context';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../lib/supabase/client';

// Mock the Supabase client
vi.mock('../../lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn().mockImplementation(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// Wrap component with AuthProvider for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth hook', () => {
  const mockUser = { id: 'user123', email: 'test@example.com' };
  const mockError = { message: 'Email already in use' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no user and loading state', () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should set user when session exists', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
      error: null,
    });

    const { result, rerender } = renderHook(() => useAuth(), { wrapper });

    // Manually trigger the effect to update the user
    await act(async () => {
      await result.current.checkUser();
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should sign up a user successfully', async () => {
    (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      });
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'New User',
        },
      },
    });

    expect(signUpResult.success).toBe(true);
    expect(signUpResult.user).toEqual(mockUser);
  });

  it('should handle sign up errors', async () => {
    (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp({
        email: 'user@example.com',
        password: 'password123',
        fullName: 'Test User',
      });
    });

    expect(signUpResult.success).toBe(false);
    expect(signUpResult.error).toBe(mockError.message);
  });

  it('should sign in a user successfully', async () => {
    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(signInResult.success).toBe(true);
    expect(signInResult.user).toEqual(mockUser);
  });

  it('should handle sign in errors', async () => {
    (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(signInResult.success).toBe(false);
    expect(signInResult.error).toBe(mockError.message);
  });

  it('should sign out a user successfully', async () => {
    (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should reset password successfully', async () => {
    (supabase.auth.resetPasswordForEmail as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('user@example.com');
    });

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://vibewell.com/auth/reset-password',
    });

    expect(resetResult.success).toBe(true);
  });
});
