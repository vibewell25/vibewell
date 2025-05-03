import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';
import { useAuth0 } from '@auth0/auth0-react';

// Mock Auth0 hook
jest.mock('@auth0/auth0-react');

describe('useAuth Hook', () => {
  const mockUser = {
    email: 'test@example.com',
    email_verified: true,
    sub: 'auth0|123456',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
      error: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn()
    });
  });

  it('should return authentication state from Auth0', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle unauthenticated state', () => {
    // Mock unauthenticated state
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: undefined,
      isLoading: false,
      error: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn()
    });
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it('should provide login function', async () => {
    const mockLoginWithRedirect = jest.fn();
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: undefined,
      isLoading: false,
      error: undefined,
      loginWithRedirect: mockLoginWithRedirect,
      logout: jest.fn()
    });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login();
    });
    
    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  it('should provide logout function', async () => {
    const mockLogout = jest.fn();
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
      error: undefined,
      loginWithRedirect: jest.fn(),
      logout: mockLogout
    });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(mockLogout).toHaveBeenCalledWith({ returnTo: expect.any(String) });
  });

  it('should provide user profile data', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toEqual({
      email: 'test@example.com',
      email_verified: true,
      sub: 'auth0|123456',
      name: 'Test User'
    });
  });

  it('should handle loading state', () => {
    // Mock loading state
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: undefined,
      isLoading: true,
      error: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn()
    });
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle authentication errors', () => {
    // Mock error state
    const authError = new Error('Authentication failed');
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: undefined,
      isLoading: false,
      error: authError,
      loginWithRedirect: jest.fn(),
      logout: jest.fn()
    });
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.error).toBe(authError);
    expect(result.current.isAuthenticated).toBe(false);
  });
}); 