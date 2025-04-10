import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { supabase } from '@/lib/supabase';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
  },
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for getSession
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });
  
  it('should initialize with loading true and user null', async () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });
  
  it('should set user when session exists', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    
    const { result, rerender } = renderHook(() => useAuth());
    
    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });
  
  it('should sign up a user successfully', async () => {
    const mockUser = { id: 'new-user', email: 'newuser@example.com' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp('newuser@example.com', 'password123', 'New User');
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
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(signUpResult.success).toBe(true);
  });
  
  it('should handle sign up errors', async () => {
    const mockError = new Error('Email already in use');
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: mockError,
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp('existing@example.com', 'password123', 'Existing User');
    });
    
    expect(signUpResult.success).toBe(false);
    expect(signUpResult.error).toBe(mockError.message);
  });
  
  it('should sign in a user successfully', async () => {
    const mockUser = { id: 'user123', email: 'user@example.com' };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('user@example.com', 'password123');
    });
    
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    
    expect(signInResult.success).toBe(true);
  });
  
  it('should handle sign in errors', async () => {
    const mockError = new Error('Invalid credentials');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: mockError,
    });
    
    const { result } = renderHook(() => useAuth());
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('wrong@example.com', 'wrongpassword');
    });
    
    expect(signInResult.success).toBe(false);
    expect(signInResult.error).toBe(mockError.message);
  });
  
  it('should sign out a user successfully', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
  
  it('should reset password successfully', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      error: null,
    });
    
    const { result } = renderHook(() => useAuth());
    
    // Save the original window.location
    const originalLocation = window.location;
    
    // Mock window.location
    delete window.location;
    window.location = { ...originalLocation, origin: 'https://vibewell.com' };
    
    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('user@example.com');
    });
    
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      { redirectTo: 'https://vibewell.com/auth/reset-password' }
    );
    
    expect(resetResult.success).toBe(true);
    
    // Restore original window.location
    window.location = originalLocation;
  });
}); 