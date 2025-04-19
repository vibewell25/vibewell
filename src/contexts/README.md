# Authentication Context Migration Guide

## Overview

The VibeWell application previously had multiple separate authentication implementations:
- `src/contexts/auth-context.tsx`
- `src/context/AuthContext.tsx`
- `mobile/src/contexts/AuthContext.tsx`

These have been consolidated into a single unified authentication context to eliminate code duplication, ensure consistency, and improve maintainability:
- `src/contexts/unified-auth-context.tsx`

This document provides guidance on migrating to the new unified authentication context.

## Migration Steps

### 1. Update imports

Replace imports from old authentication contexts with the new unified context:

```tsx
// OLD IMPORT - Remove these
import { useAuth } from '@/contexts/auth-context';
// OR
import { useAuth } from '@/context/AuthContext';

// NEW IMPORT - Use this instead
import { useAuth } from '@/contexts/unified-auth-context';
```

### 2. Use new role-based access control features

The unified auth context provides built-in role-based access control:

```tsx
import { useAuth, UserRole } from '@/contexts/unified-auth-context';

function AdminPanel() {
  const { hasRole, isAdmin } = useAuth();
  
  // Check if user is an admin
  if (!isAdmin()) {
    return <AccessDenied />;
  }
  
  // Or check for a specific role
  if (!hasRole(UserRole.PREMIUM)) {
    return <UpgradeRequired />;
  }
  
  return <div>Admin Panel Content</div>;
}
```

### 3. Access additional methods

The unified auth context provides additional methods not present in all previous implementations:

- `updateProfile`: Update user profile information
- `verifyEmail`: Verify a user's email with a token
- `resendVerificationEmail`: Resend verification email
- Various social login methods

### 4. Mobile-specific considerations

For mobile app development, the unified context includes cross-platform support:

- Platform detection happens automatically
- Mobile-specific auth flows are identified and handled appropriately
- Consistent API across platforms

### 5. Access additional properties

The unified context provides additional properties:

- `isAuthenticated`: Boolean indicating whether a user is logged in
- `userRole`: Current user's role (USER, ADMIN, PREMIUM)

## Example Usage

```tsx
import { useAuth, UserRole } from '@/contexts/unified-auth-context';

function ProfilePage() {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    updateProfile,
    signOut
  } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <LoginRequired />;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
      
      <button 
        onClick={() => updateProfile({ 
          name: 'New Name', 
          avatar_url: 'https://example.com/avatar.png' 
        })}
      >
        Update Profile
      </button>
    </div>
  );
}
```

## Backwards Compatibility

For a transitional period, the old auth contexts will continue to work but will forward to the unified implementation. Plan to migrate all components to the new unified context by [date] when the old contexts will be removed.

## Questions and Support

If you encounter any issues during migration, please contact the development team. 