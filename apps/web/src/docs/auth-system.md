# Authentication System Documentation

This document outlines the authentication system in the VibeWell application, including the standard routes, components, and patterns to follow.

## Authentication Hook

The central authentication hook is provided by the AuthContext, which wraps Supabase authentication:

```tsx
import { useAuth } from '@/contexts/auth-context';

// In your component
const { user, signIn, signUp /* etc. */ } = useAuth();
```

## Standard Routes

Always use the route constants instead of hardcoding routes:

```tsx
import { ROUTES } from '@/constants/routes';

// Use in navigation
<Link href={ROUTES.AUTH.LOGIN}>Sign in</Link>;
```

The following routes are standardized:

- `/auth/login` - Sign in page (redirect from `/auth/sign-in`)
- `/auth/signup` - Sign up page (redirect from `/auth/sign-up` and `/auth/register`)
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Set new password
- `/auth/verify-email` - Verify email address
- `/auth/mfa-setup` - Set up multi-factor authentication

## Authentication Methods

The following methods are available through the `useAuth` hook:

| Method                    | Parameters                                        | Return Value                        | Description                     |
| ------------------------- | ------------------------------------------------- | ----------------------------------- | ------------------------------- |
| `signIn`                  | `(email: string, password: string)`               | `Promise<{ error: Error \| null }>` | Sign in with email and password |
| `signUp`                  | `(email: string, password: string, name: string)` | `Promise<{ error: Error \| null }>` | Create a new account            |
| `signOut`                 | `()`                                              | `Promise<void>`                     | Sign out the current user       |
| `resetPassword`           | `(email: string)`                                 | `Promise<{ error: Error \| null }>` | Send a password reset email     |
| `updatePassword`          | `(password: string)`                              | `Promise<{ error: Error \| null }>` | Update user's password          |
| `verifyEmail`             | `(token: string)`                                 | `Promise<void>`                     | Verify email with token         |
| `resendVerificationEmail` | `()`                                              | `Promise<void>`                     | Resend verification email       |
| `signInWithGoogle`        | `()`                                              | `Promise<void>`                     | Sign in with Google             |
| `signInWithFacebook`      | `()`                                              | `Promise<void>`                     | Sign in with Facebook           |
| `signInWithApple`         | `()`                                              | `Promise<void>`                     | Sign in with Apple              |

## Error Handling Pattern

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      // Success actions
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

## Protected Routes

To protect routes that require authentication:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ROUTES } from '@/constants/routes';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(
        `${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  // Your protected page content here
}
```

## Migration Guide

If you're using the old authentication patterns:

1. Update imports to use `@/contexts/auth-context` instead of `@/hooks/useAuth`
2. Update route references to use constants from `@/constants/routes`
3. Update function calls to match the current API (check error handling)
4. Test thoroughly after migration
