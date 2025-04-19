# Authentication System Migration Guide

This document provides a step-by-step guide for migrating the application's authentication system to the new standardized approach.

## Migration Overview

The migration consists of the following steps:

1. Updating import paths
2. Updating route references
3. Updating function signatures
4. Implementing standardized components
5. Testing all auth flows
6. Cleaning up duplicate routes

## Prerequisites

Before starting the migration:

1. Ensure you have the latest version of the codebase
2. Create a new branch for the migration work
3. Understand the [auth system documentation](./auth-system.md)

## Step-by-Step Migration

### 1. Updating Import Paths

All components should import the auth hook from the centralized location:

```tsx
// OLD - don't use this anymore
import { useAuth } from '@/hooks/useAuth';

// NEW - use this instead
import { useAuth } from '@/contexts/auth-context';
```

We've already updated `useAuth.ts` to re-export from the context, so this change is technically optional but recommended for clarity.

### 2. Updating Route References

Replace hardcoded route strings with constants:

```tsx
// OLD
<Link href="/auth/login">Sign in</Link>

// NEW
import { ROUTES } from '@/constants/routes';
<Link href={ROUTES.AUTH.LOGIN}>Sign in</Link>
```

Pay special attention to:
- Navigation links in headers/footers
- Auth flow redirects
- Protected route fallbacks

### 3. Updating Function Signatures

Ensure all auth function calls match the expected signatures:

```tsx
// OLD (might vary between components)
await signIn({ email, password });
await signup(email, password);

// NEW (standardized)
const { error } = await signIn(email, password);
const { error } = await signUp(email, password, name);
```

Make sure to handle errors consistently:

```tsx
try {
  const { error } = await signIn(email, password);
  if (error) {
    setError(error.message);
  } else {
    // Success case
  }
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
} finally {
  setIsLoading(false);
}
```

### 4. Implementing Standardized Components

Use the new standardized auth components for consistency:

```tsx
// OLD (custom form implementation)
<div className="container">
  <h1>Sign in</h1>
  <form>...</form>
</div>

// NEW (standardized components)
import { AuthForm, AuthFormInput, AuthSubmitButton } from '@/components/auth/auth-form';

<AuthForm
  type="login"
  title="Sign in"
  error={error}
  isLoading={isLoading}
  footerText="Don't have an account?"
  footerLink={{ text: "Sign up", href: ROUTES.AUTH.SIGNUP }}
>
  <form>
    <AuthFormInput id="email" label="Email" /* ... */ />
    <AuthSubmitButton isLoading={isLoading} text="Sign in" />
  </form>
</AuthForm>
```

### 5. Testing All Auth Flows

Test each authentication flow thoroughly:

- Sign in (email/password)
- Sign in (social providers)
- Sign up (registration)
- Password reset flow
- Email verification
- Protected routes
- Logout

Run the unit tests for the auth context:

```bash
npm test -- -t "AuthContext"
```

### 6. Cleaning Up Duplicate Routes

After confirming all redirects work correctly in production:

1. Run the cleanup script in dry-run mode:
   ```bash
   node scripts/cleanup-auth-routes.js --dry-run
   ```

2. Review the proposed changes

3. Apply the changes:
   ```bash
   node scripts/cleanup-auth-routes.js
   ```

## Troubleshooting

If you encounter issues during migration:

1. **Auth hook not working**: Check that the context provider is properly wrapping your application.

2. **Redirects not working**: Verify that the redirect pages are correctly configured.

3. **Function signature mismatches**: Compare the function call to the expected signature in the auth context.

4. **Route conflicts**: Use the Network tab in your browser to check which route is actually being hit.

## Verification Checklist

- [ ] All components use the correct import path
- [ ] All route references use the route constants
- [ ] All function calls use the correct signatures
- [ ] Error handling is consistent across all components
- [ ] All auth flows have been tested and work correctly
- [ ] Unit tests for auth context pass
- [ ] Duplicate routes have been cleaned up 