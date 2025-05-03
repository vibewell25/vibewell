import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock user data
const MOCK_USER = {
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://via.placeholder.com/150',
};

// Create a context for Auth state
interface AuthContextType {
  user: typeof MOCK_USER | null;
  error: Error | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  error: null,
  isLoading: false,
});

// Provider component that wraps the app and provides auth context
export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider value={{ user, error, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for components to get the auth object
export const useUser = () => useContext(AuthContext);

// Mock function for handling login
export const handleLogin = async () => {
  window.location.href = '/api/auth/callback';
  return null;
};

// Mock function for handling logout
export const handleLogout = async () => {
  window.location.href = '/';
  return null;
};

// Mock function to check if user is authenticated
export const isAuthenticated = () => {
  return true;
};

// Export the mocked auth utils
export default {
  UserProvider,
  useUser,
  handleLogin,
  handleLogout,
  isAuthenticated,
}; 