import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/auth-context';
import { prisma } from '@/lib/database/client';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn().mockImplementation(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}));

// Wrap component with AuthProvider for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth hook', () => {
  const mockUser = { id: 'user123', email: 'test@example.com' };
  const mockError = { message: 'Email already in use' };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should initialize with no user and loading state', () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });
  
  it('should set user when session exists', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { 
        session: { 
          user: mockUser 
        } 
      },
      error: null
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
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User'
      });
    });
    
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'New User'
        }
      }
    });
    
    expect(signUpResult.success).toBe(true);
    expect(signUpResult.user).toEqual(mockUser);
  });
  
  it('should handle sign up errors', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: mockError
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp({
        email: 'user@example.com',
        password: 'password123',
        fullName: 'Test User'
      });
    });
    
    expect(signUpResult.success).toBe(false);
    expect(signUpResult.error).toBe(mockError.message);
  });
  
  it('should sign in a user successfully', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn({
        email: 'user@example.com',
        password: 'password123'
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
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: mockError
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn({
        email: 'user@example.com',
        password: 'password123'
      });
    });
    
    expect(signInResult.success).toBe(false);
    expect(signInResult.error).toBe(mockError.message);
  });
  
  it('should sign out a user successfully', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
  
  it('should reset password successfully', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: null
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('user@example.com');
    });
    
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      { redirectTo: 'https://vibewell.com/auth/reset-password' }
    );
    
    expect(resetResult.success).toBe(true);
  });
  
  it('should handle reset password errors', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: mockError
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let resetResult;
    await act(async () => {
      resetResult = await result.current.resetPassword('user@example.com');
    });
    
    expect(resetResult.success).toBe(false);
    expect(resetResult.error).toBe(mockError.message);
  });
}); 