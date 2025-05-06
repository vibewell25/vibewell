# Auth Hook Standardization Guide

## Overview

This guide outlines the standardization process for authentication hooks in the VibeWell platform. The codebase currently contains multiple authentication hook implementations, which has led to inconsistencies, code duplication, and maintenance challenges. This guide aims to establish a clear standard and migration path to a unified authentication approach.

## Table of Contents

1. [Current State](#current-state)
2. [Standardization Goals](#standardization-goals)
3. [The Unified Auth Hook](#the-unified-auth-hook)
4. [Migration Path](#migration-path)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Testing Standardized Auth](#testing-standardized-auth)
7. [Common Use Cases](#common-use-cases)

## Current State

The VibeWell codebase currently contains several authentication-related hooks and implementations:

1. **Legacy auth hooks**:
   - `src/hooks/useAuth.ts` (deprecated)
   - `src/hooks/use-auth.ts` (deprecated)
   - Various context-specific auth implementations

2. **Unified implementation**:
   - `src/contexts/unified-auth-context.tsx` - Core context provider
   - `src/hooks/use-unified-auth.ts` - Standardized hook

3. **Various usages**:
   - Multiple components importing from different auth hooks
   - Inconsistent access patterns for user info and auth methods

This fragmentation leads to:
- Inconsistent authentication behavior
- Duplicated code and logic
- Higher maintenance burden
- Potential security issues
- Confusion for developers

## Standardization Goals

1. **Single Source of Truth**: Establish `use-unified-auth.ts` as the only entry point for authentication
2. **Consistent API**: Ensure consistent method names, parameters, and return types
3. **Complete Functionality**: Support all necessary auth features (web and mobile)
4. **Type Safety**: Provide comprehensive TypeScript interfaces and type checking
5. **Proper Error Handling**: Standardize error management across auth operations
6. **Documentation**: Clear docs for all authentication patterns

## The Unified Auth Hook

### Core Implementation

The standardized auth hook is implemented in two key files:

1. `src/contexts/unified-auth-context.tsx` - Contains the context provider and core auth logic
2. `src/hooks/use-unified-auth.ts` - Exports the hook and helper utilities

### Usage

```tsx
// Import the hook
import { useAuth } from '@/hooks/use-unified-auth';

function MyComponent() {
  // Use the hook
  const { 
    user,                   // The current user
    loading,                // Auth loading state
    isAuthenticated,        // Boolean indicating if user is logged in
    signIn,                 // Sign in with email/password
    signOut,                // Sign out
    signInWithGoogle,       // Social login methods
    hasRole,                // Role checking
    // ...other methods
  } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### Helper Utilities

The auth hook exports additional helper functions for specific use cases:

```tsx
import { AuthHelpers, getAuthState, checkUserRole } from '@/hooks/use-unified-auth';

// Component example
function ProfileDisplay() {
  const auth = useAuth();
  const displayName = AuthHelpers.getUserDisplayName(auth);
  const avatarUrl = AuthHelpers.getUserAvatar(auth);
  
  return (
    <div>
      <img src={avatarUrl || '/default-avatar.png'} alt={displayName} />
      <h2>{displayName}</h2>
    </div>
  );
}

// Server-side example (API route)
async function handler(req, res) {
  const isUserAuthenticated = await isAuthenticated();
  const canAccessAdmin = await checkUserRole(UserRole.ADMIN);
  
  if (!isUserAuthenticated || !canAccessAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Process request...
}
```

## Migration Path

### For Developers

1. **Identify Usage**: Find all components using deprecated auth hooks
2. **Replace Imports**: Update import statements to use the standardized hook
3. **Update Implementation**: Adjust component code to match the new API
4. **Test Thoroughly**: Verify auth behavior after migration

### Code Migration Steps

1. **Replace imports**:

```tsx
// FROM:
import { useAuth } from '@/hooks/useAuth';
// or
import { useAuth } from '@/hooks/use-auth';
// or
import { useAuth } from '@/contexts/auth-context';

// TO:
import { useAuth } from '@/hooks/use-unified-auth';
```

2. **Update hook usage**:

```tsx
// FROM:
const { user, login, logout } = useAuth();

// TO:
const { user, signIn, signOut } = useAuth();
```

## Implementation Guidelines

### Provider Setup

Always wrap your application with the `AuthProvider`:

```tsx
// src/app/providers.tsx or similar
import { AuthProvider } from '@/hooks/use-unified-auth';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {/* Other providers */}
      {children}
    </AuthProvider>
  );
}
```

### Authentication Operations

For consistent auth operations:

```tsx
// Login
const handleLogin = async () => {
  const { error } = await signIn(email, password);
  if (error) {
    // Handle error
  }
};

// Registration
const handleSignUp = async () => {
  const { error } = await signUp(email, password, name);
  if (error) {
    // Handle error
  }
};

// Logout
const handleLogout = async () => {
  await signOut();
  // Redirect or update UI
};
```

### Role-Based Access Control

```tsx
const { hasRole, isAdmin } = useAuth();

// Check if user has specific role
if (hasRole(UserRole.PREMIUM)) {
  // Show premium content
}

// Check if user is admin
if (isAdmin()) {
  // Show admin controls
}
```

### Protected Routes

```tsx
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, hasRole, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

## Testing Standardized Auth

### Unit Tests

```tsx
// Example test for a component using the auth hook
import { render, screen } from '@testing-library/react';
import { useAuth } from '@/hooks/use-unified-auth';
import { UserProfile } from './UserProfile';

// Mock the auth hook
jest.mock('@/hooks/use-unified-auth', () => ({
  useAuth: jest.fn(),
}));

describe('UserProfile', () => {
  it('displays user information when authenticated', () => {
    // Setup the mock
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'user@example.com', user_metadata: { name: 'Test User' } },
      isAuthenticated: true,
      loading: false,
    });
    
    render(<UserProfile />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
  
  it('shows login prompt when not authenticated', () => {
    // Setup the mock
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    
    render(<UserProfile />);
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test the complete authentication flow including context providers:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/hooks/use-unified-auth';
import { LoginForm } from './LoginForm';

// Mock Supabase client
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      // ...other methods
    },
  },
}));

describe('LoginForm with AuthProvider', () => {
  it('handles successful login', async () => {
    // Setup the mock
    const mockSignIn = jest.fn().mockResolvedValue({
      data: { user: { id: '123', email: 'user@example.com' } },
      error: null,
    });
    
    supabase.auth.signInWithPassword = mockSignIn;
    
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText(/sign in/i));
    
    // Assert successful login
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
```

## Common Use Cases

### User Profile Display

```tsx
function UserProfileHeader() {
  const { user } = useAuth();
  const { getUserDisplayName, getUserAvatar } = AuthHelpers;
  
  return (
    <div className="flex items-center space-x-2">
      <img
        src={getUserAvatar(user) || '/default-avatar.png'}
        alt="User avatar"
        className="h-8 w-8 rounded-full"
      />
      <span>{getUserDisplayName(user)}</span>
    </div>
  );
}
```

### Conditional Rendering Based on Auth State

```tsx
function NavBar() {
  const { isAuthenticated, loading, user, signOut } = useAuth();
  
  return (
    <nav>
      <a href="/">Home</a>
      
      {loading ? (
        <span>Loading...</span>
      ) : isAuthenticated ? (
        <div>
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profile</a>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <a href="/login">Sign In</a>
          <a href="/register">Sign Up</a>
        </div>
      )}
    </nav>
  );
}
```

### Social Authentication

```tsx
function SocialLogin() {
  const { signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  
  return (
    <div className="flex flex-col space-y-2">
      <button onClick={signInWithGoogle} className="btn-google">
        Sign in with Google
      </button>
      <button onClick={signInWithFacebook} className="btn-facebook">
        Sign in with Facebook
      </button>
      <button onClick={signInWithApple} className="btn-apple">
        Sign in with Apple
      </button>
    </div>
  );
}
```

## Conclusion

Standardizing authentication hooks across the VibeWell platform is a critical step in improving code quality, maintainability, and security. By following this guide, developers can ensure consistent auth implementation that works reliably across web and mobile platforms.

For assistance with the migration process or questions about the standardized auth hook, please contact the platform architecture team.

## Related Documentation

- [Security Best Practices](../security-best-practices.md)
- [Component Implementation Guide](./component-implementation-guide.md)
- [State Management Guide](./state-management-guide.md)
- [Accessibility Guide](../accessibility/accessibility-guide.md) 