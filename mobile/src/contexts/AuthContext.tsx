import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config';

// Define types
interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to set the auth token
  const setToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
      axios.defaults.headers.common['Authorization'] = token;
    } catch (e) {
      console.error('Error setting auth token:', e);
    }
  };

  // Function to clear the auth token
  const clearToken = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Error clearing auth token:', e);
    }
  };

  // Get user from token
  const getUserFromToken = (token: string) => {
    try {
      const decodedToken = jwtDecode<{ id: string; email: string; name: string; role: string }>(token);
      return {
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name,
        role: decodedToken.role,
      };
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  // Check if there's a stored token on app load
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        
        if (token) {
          axios.defaults.headers.common['Authorization'] = token;
          const user = getUserFromToken(token);
          
          if (user) {
            setUser(user);
            setIsLoggedIn(true);
          } else {
            // Token invalid or expired
            await clearToken();
          }
        }
      } catch (e) {
        console.error('Error loading auth token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success && response.data.token) {
        const token = response.data.token;
        await setToken(token);
        
        const user = getUserFromToken(token);
        if (user) {
          setUser(user);
          setIsLoggedIn(true);
        }
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      setError(e.message || 'An error occurred during login');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      
      if (response.data.success) {
        // Automatically log in after successful registration
        await login(email, password);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      setError(e.message || 'An error occurred during registration');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await clearToken();
      setUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 