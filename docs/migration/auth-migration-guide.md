# Auth Hook Migration Guide

## Overview

To improve maintainability and reduce code duplication, we are standardizing all authentication-related functionality to use a single implementation. This guide provides instructions for migrating existing code to use the standardized auth hook.

## Why Migrate?

- **Consistency**: Ensures all components use the same authentication logic
- **Maintenance**: Makes it easier to update auth functionality in one place
- **Type Safety**: Provides better TypeScript type definitions
- **Features**: Access to additional authentication helpers and utilities

## Migration Steps

### 1. Update Imports

Replace imports from any of the following:
```typescript
import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/use-auth';
import { useAuth } from '@/hooks/unified-auth';
import { useAuth } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
```

With the standardized import:
```typescript
import { useAuth } from '@/hooks/use-unified-auth';
```

### 2. Update Hook Usage

The standardized hook provides the following properties and methods:

```typescript
const {
  // User information
  user,                  // The authenticated user object
  isAuthenticated,       // Boolean indicating if the user is authenticated
  loading,               // Boolean indicating if auth state is loading
  
  // Authentication methods
  signIn,                // Function to sign in with email/password
  signUp,                // Function to create a new account
  signOut,               // Function to log out
  signInWithGoogle,      // Function to sign in with Google
  signInWithFacebook,    // Function to sign in with Facebook
  signInWithApple,       // Function to sign in with Apple
  
  // Authorization helpers
  hasRole,               // Function to check if user has a specific role
  isAdmin,               // Boolean indicating if user is an admin
  
  // Profile management
  updateProfile,         // Function to update user profile
  
  // Additional utilities
  getToken,              // Function to get the auth token
  refreshToken,          // Function to refresh the auth token
} = useAuth();
```

### 3. Replace Custom Access Control Logic

If you've implemented custom role checking or permissions logic, replace it with the built-in helpers:

**Before:**
```typescript
// Manual role checking
if (user && user.roles && user.roles.includes('admin')) {
  // Admin-only code
}
```

**After:**
```typescript
// Using the built-in helper
if (isAdmin) {
  // Admin-only code
}

// Or for other roles
if (hasRole('manager')) {
  // Manager-only code
}
```

### 4. Automated Migration

You can run the automated migration script to update imports across the codebase:

```bash
node scripts/update-imports.js
```

This will automatically update import statements in all TypeScript and JavaScript files.

### 5. Verify Changes

After updating imports and hook usage, verify that authentication still works correctly:

- Run tests: `npm run test`
- Check for TypeScript errors: `npx tsc --noEmit`
- Test login/logout functionality in the application

## Advanced Usage

### Using with Custom Wrappers

If you have custom auth wrappers or higher-order components, update them to use the standardized hook:

```typescript
import { useAuth } from '@/hooks/use-unified-auth';

export function withAuth(Component) {
  return function WithAuth(props) {
    const auth = useAuth();
    
    if (auth.loading) {
      return <LoadingSpinner />;
    }
    
    if (!auth.isAuthenticated) {
      return <Redirect to="/login" />;
    }
    
    return <Component {...props} auth={auth} />;
  };
}
```

### Using Auth Helpers Outside of React Components

For non-component code that needs authentication utilities, import the helper functions:

```typescript
import { getAuthState, checkUserRole, isAuthenticated } from '@/hooks/use-unified-auth';

// Use in a utility function
export function checkAccess(resource) {
  const authState = getAuthState();
  return checkUserRole(authState.user, 'editor');
}
```

## Troubleshooting

### "Property X does not exist on type..."

If you encounter TypeScript errors related to missing properties, ensure you're using properties that exist in the standardized hook. Check the available properties and methods in the documentation.

### Console Warnings

During the migration period, you might see deprecation warnings in the console when using the old hooks. These warnings will help identify code that still needs to be migrated.

## Need Help?

If you encounter any issues during migration, contact the development team or refer to the full documentation in `docs/authentication.md`. 