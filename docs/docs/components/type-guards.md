# Type Guards in Vibewell

This documentation explains the type guard system implemented in the Vibewell codebase to handle TypeScript errors related to type mismatches, particularly for `undefined` or `null` values.

## Overview

Type guards are special functions that help TypeScript narrow down the type of a variable within a conditional block. They allow us to safely handle union types (like `string | undefined`) by checking their type before using them.

## Type Guard Utilities

We've implemented several type guard utilities in the codebase:

### Core Type Guards (`src/utils/type-guards.ts`)

This file contains the primary type guard functions used throughout the application:

- `isDefined<T>(value: T | undefined): value is T` - Checks if a value is not undefined
- `isNotNull<T>(value: T | null): value is T` - Checks if a value is not null
- `exists<T>(value: T | null | undefined): value is T` - Checks if a value exists (not null and not undefined)
- `isString(value: unknown): value is string` - Checks if a value is a string
- `isNumber(value: unknown): value is number` - Checks if a value is a number
- `isError(value: unknown): value is Error` - Checks if a value is an Error object
- `isArray<T>(value: unknown): value is Array<T>` - Checks if a value is an array
- `isNonEmptyArray<T>(arr: T[] | null | undefined): arr is T[]` - Checks if an array exists and has at least one element
- `isObject(value: unknown): value is Record<string, unknown>` - Checks if a value is an object
- `hasProperty<T, K>(obj: T, prop: K): obj is T & Record<K, unknown>` - Checks if an object has a specific property

### Error Handling Guards (`src/utils/error-utils.ts`)

This file contains utilities for error handling:

- `getErrorMessage(error: unknown): string` - Safely extracts a message from any error type
- `isNetworkError(error: unknown): boolean` - Checks if an error is a network error
- `isTimeoutError(error: unknown): boolean` - Checks if an error is a timeout error
- `isNotFoundError(error: unknown): boolean` - Checks if an error is a not-found error
- `isServerError(error: unknown): boolean` - Checks if an error is a server error
- `enhanceError(error: unknown, options?)` - Enhances an error with appropriate metadata

### Authentication Guards (`src/utils/auth-guards.ts`)

This file contains type guards for authentication:

- `isAuthenticated(user: User | null | undefined): user is User` - Checks if a user is authenticated
- `hasRole(user: User | null | undefined, role: string | string[]): boolean` - Checks if a user has a role
- `hasAllRoles(user: User | null | undefined, roles: string[]): boolean` - Checks if a user has all specified roles
- `hasPermission(user: User | null | undefined, permission: string, resource?: string): boolean` - Checks if a user has a permission

## How to Use Type Guards

### Basic Usage

Type guards should be used whenever you have a variable that might be `undefined`, `null`, or of a different type than expected:

```typescript
import { exists, isString } from '@/utils/type-guards';

function processData(data: string | undefined) {
  // Check if data exists before using it
  if (exists(data)) {
    // Here TypeScript knows that data is a string (not undefined)
    console.log(data.toUpperCase());
  } else {
    console.log('No data provided');
  }
}

function handleResponse(response: unknown) {
  // Check if response is a string before using string methods
  if (isString(response)) {
    // Here TypeScript knows that response is a string
    return response.trim();
  } else {
    return String(response);
  }
}
```

### With Error Handling

```typescript
import { isError } from '@/utils/type-guards';
import { enhanceError } from '@/utils/error-utils';

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    // Process the response...
  } catch (error) {
    // Use enhanceError to properly categorize the error
    const enhancedError = enhanceError(error, {
      metadata: { component: 'DataFetcher' }
    });
    
    // Now we can safely handle the error
    console.error(enhancedError.errorMessage);
    
    // You can also check the type of the original error
    if (isError(error)) {
      // Access error properties safely
      console.error(error.stack);
    }
  }
}
```

### With Authentication

```typescript
import { isAuthenticated, hasRole } from '@/utils/auth-guards';

function renderUserProfile(user: User | null | undefined) {
  // Check if user is authenticated
  if (isAuthenticated(user)) {
    // Here TypeScript knows that user is a valid User object
    return <ProfileComponent userName={user.name} />;
  } else {
    return <LoginPrompt />;
  }
}

function renderAdminPanel(user: User | null | undefined) {
  // Check if user has admin role
  if (hasRole(user, 'admin')) {
    return <AdminPanel />;
  } else {
    return <AccessDenied />;
  }
}
```

## Best Practices

1. **Always use type guards** for variables that might be `undefined` or `null`
2. **Avoid using non-null assertion operator** (`!`) which can lead to runtime errors
3. **Prefer using the `exists` function** over manual null checks for better readability
4. **Use specialized type guards** like `isAuthenticated` for domain-specific type checking
5. **Combine type guards with conditional rendering** in React components
6. **Add new type guards** as needed for specific types in your application

## Testing

Type guards should be thoroughly tested to ensure they properly handle all possible input values. Examples of tests for type guards:

```typescript
describe('Type Guards', () => {
  test('isDefined correctly identifies defined values', () => {
    expect(isDefined('hello')).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(undefined)).toBe(false);
  });
  
  test('exists correctly identifies existing values', () => {
    expect(exists('hello')).toBe(true);
    expect(exists(0)).toBe(true);
    expect(exists(null)).toBe(false);
    expect(exists(undefined)).toBe(false);
  });
});
```

## Adding New Type Guards

When you encounter a new type checking scenario, consider adding a new type guard to the appropriate utility file. This promotes code reuse and consistency throughout the codebase. 