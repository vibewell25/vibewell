/**
 * Example test for auth hook
 * 
 * This is a comprehensive example of how to test the auth hook,
 * covering authentication, authorization, and error handling.
 */

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/use-unified-auth';
import { AuthProvider } from '@/contexts/auth-provider';
import { mockUser, mockAdmin } from '@/test-utils/mock-data';

// Mock the API responses
jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
}));

import { fetchUser, login, logout, register } from '@/lib/api';

describe('useAuth hook', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage for token storage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  // Create a wrapper component that includes the AuthProvider
  const wrapper = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  // Test 1: Initial state should be unauthenticated
  it('should start with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBeFalsy();
    expect(result.current.loading).toBeTruthy();
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });

  // Test 2: Should handle successful login
  it('should handle successful login', async () => {
    // Mock successful login response
    (login as jest.Mock).mockResolvedValueOnce({
      token: 'fake-auth-token',
      user: mockUser,
    });
    
    // Mock successful user fetch
    (fetchUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act: Call the sign in function
    await act(async () => {
      await result.current.signIn({ email: 'user@example.com', password: 'password' });
    });

    // Assert: Check that state was updated correctly
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBeTruthy();
    expect(result.current.loading).toBeFalsy();
    
    // Check that token was stored
    expect(window.localStorage.setItem).toHaveBeenCalledWith('auth-token', 'fake-auth-token');
  });

  // Test 3: Should handle login errors
  it('should handle login errors', async () => {
    // Mock failed login
    const errorMessage = 'Invalid credentials';
    (login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act: Call the sign in function and catch error
    await act(async () => {
      try {
        await result.current.signIn({ email: 'invalid@example.com', password: 'wrong' });
      } catch (error) {
        // This is expected
      }
    });

    // Assert: Check that state remains unauthenticated
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBeFalsy();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toEqual(new Error(errorMessage));
  });

  // Test 4: Should handle sign out
  it('should handle sign out', async () => {
    // Setup: First sign in successfully
    (login as jest.Mock).mockResolvedValueOnce({
      token: 'fake-auth-token',
      user: mockUser,
    });
    (fetchUser as jest.Mock).mockResolvedValueOnce(mockUser);
    
    // Mock successful logout
    (logout as jest.Mock).mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act: Sign in and then sign out
    await act(async () => {
      await result.current.signIn({ email: 'user@example.com', password: 'password' });
    });
    
    await act(async () => {
      await result.current.signOut();
    });

    // Assert: Check that state was updated correctly
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBeFalsy();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-token');
  });

  // Test 5: Should check user roles correctly
  it('should check user roles correctly', async () => {
    // Mock admin user login
    (login as jest.Mock).mockResolvedValueOnce({
      token: 'fake-admin-token',
      user: mockAdmin,
    });
    (fetchUser as jest.Mock).mockResolvedValueOnce(mockAdmin);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act: Sign in as admin
    await act(async () => {
      await result.current.signIn({ email: 'admin@example.com', password: 'password' });
    });

    // Assert: Check that role helpers work correctly
    expect(result.current.isAuthenticated).toBeTruthy();
    expect(result.current.isAdmin).toBeTruthy();
    expect(result.current.hasRole('admin')).toBeTruthy();
    expect(result.current.hasRole('user')).toBeTruthy();
    expect(result.current.hasRole('moderator')).toBeFalsy();
  });

  // Test 6: Should handle initial token restoration
  it('should restore session from stored token', async () => {
    // Mock stored token
    (window.localStorage.getItem as jest.Mock).mockReturnValueOnce('stored-token');
    
    // Mock successful user fetch with token
    (fetchUser as jest.Mock).mockResolvedValueOnce(mockUser);

    // Render hook
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initialization
    await act(async () => {
      // Just waiting for promises to resolve
    });

    // Assert: Check that state was hydrated from token
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBeTruthy();
    expect(fetchUser).toHaveBeenCalled();
  });

  // Test 7: Should handle registration
  it('should handle user registration', async () => {
    // Mock successful registration
    (register as jest.Mock).mockResolvedValueOnce({
      token: 'new-user-token',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act: Register new user
    await act(async () => {
      await result.current.signUp({
        email: 'newuser@example.com',
        password: 'password',
        name: 'New User',
      });
    });

    // Assert: Check that state was updated correctly
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBeTruthy();
    expect(window.localStorage.setItem).toHaveBeenCalledWith('auth-token', 'new-user-token');
  });
}); 