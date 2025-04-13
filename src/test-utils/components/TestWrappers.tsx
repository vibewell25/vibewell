import React, { ReactNode } from 'react';
import { ThemeProvider } from '../../components/theme-provider';
import { MemoryRouter } from 'react-router-dom';

/**
 * Default wrapper uses ThemeProvider
 */
export const DefaultWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

/**
 * Router wrapper for components that need routing
 */
export const RouterWrapper: React.FC<{ 
  children: ReactNode;
  initialRoute?: string;
}> = ({ children, initialRoute = '/' }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </MemoryRouter>
);

/**
 * Auth wrapper for testing authenticated components
 */
export const AuthWrapper: React.FC<{ 
  children: ReactNode;
  mockUser?: any;
}> = ({ children, mockUser = { id: 'test-user-id', name: 'Test User' } }) => (
  <ThemeProvider>
    {/* Simulating an auth provider - implement with your actual AuthProvider */}
    <div data-testid="mock-auth-provider" data-user={JSON.stringify(mockUser)}>
      {children}
    </div>
  </ThemeProvider>
);

/**
 * Combined wrapper for components that need routing and auth
 */
export const AuthRouterWrapper: React.FC<{ 
  children: ReactNode;
  initialRoute?: string;
  mockUser?: any;
}> = ({ 
  children, 
  initialRoute = '/',
  mockUser = { id: 'test-user-id', name: 'Test User' }  
}) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <ThemeProvider>
      <div data-testid="mock-auth-provider" data-user={JSON.stringify(mockUser)}>
        {children}
      </div>
    </ThemeProvider>
  </MemoryRouter>
); 