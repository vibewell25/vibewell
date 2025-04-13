# Error Handling System

This document describes the error handling system in the Vibewell platform, including best practices for capturing, logging, and displaying errors to users.

## Overview

The Vibewell error handling system provides a standardized way to manage errors throughout the application. It offers:

1. **Standardized Error Structure** - A consistent format for all errors
2. **Centralized Error Logging** - A unified approach to capturing and recording errors
3. **Contextual Error Display** - Appropriate error messages for users based on error severity
4. **Error Analytics** - Tracking and analysis of error patterns
5. **Error Recovery** - Mechanisms for retry and recovery when possible

## Core Components

### ErrorHandlerProvider

The `ErrorHandlerProvider` is a React context provider that supplies error handling capabilities throughout the application.

```tsx
// In your app's root component
import { ErrorHandlerProvider } from '../utils/error-handler';

function App() {
  return (
    <ErrorHandlerProvider>
      {/* Your application components */}
    </ErrorHandlerProvider>
  );
}
```

### useErrorHandler Hook

The `useErrorHandler` hook provides access to error handling functions in your components.

```tsx
import { useErrorHandler } from '../utils/error-handler';

function MyComponent() {
  const { captureError, showErrorToUser } = useErrorHandler();
  
  // Use these functions in your component
}
```

## Error Types and Categories

### Error Severity Levels

```typescript
enum ErrorSeverity {
  INFO = 'info',        // Informational messages, not true errors
  WARNING = 'warning',  // Minor issues that don't break functionality
  ERROR = 'error',      // Standard errors that affect functionality
  CRITICAL = 'critical', // Serious errors that prevent core features
  FATAL = 'fatal'       // Catastrophic errors that crash the application
}
```

### Error Sources

```typescript
enum ErrorSource {
  UI = 'ui',           // Errors from the user interface
  API = 'api',         // Errors from API calls
  DATABASE = 'database', // Database-related errors
  NETWORK = 'network', // Network connectivity issues
  SYSTEM = 'system',   // System-level errors
  UNKNOWN = 'unknown'  // Unknown source
}
```

### Error Categories

```typescript
enum ErrorCategory {
  VALIDATION = 'validation',         // Input validation errors
  AUTHENTICATION = 'authentication', // Authentication failures
  AUTHORIZATION = 'authorization',   // Permissions issues
  RESOURCE_NOT_FOUND = 'resource_not_found', // 404-type errors
  TIMEOUT = 'timeout',               // Operation timeouts
  SERVER = 'server',                 // Server-side errors
  CLIENT = 'client',                 // Client-side errors
  UNKNOWN = 'unknown'                // Uncategorized errors
}
```

## Basic Usage

### Capturing Errors

```typescript
import { useErrorHandler, ErrorSource, ErrorCategory, ErrorSeverity } from '../utils/error-handler';

function MyComponent() {
  const { captureError, logError, showErrorToUser } = useErrorHandler();
  
  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      // Create a standardized error object
      const appError = captureError(error, {
        source: ErrorSource.API,
        category: ErrorCategory.SERVER,
        severity: ErrorSeverity.ERROR,
        code: 'API_FETCH_FAILED',
        metadata: { 
          endpoint: '/api/data',
          requestId: '12345'
        }
      });
      
      // Log the error
      logError(appError);
      
      // Show error to user
      showErrorToUser(appError);
    }
  };
  
  return <button onClick={handleClick}>Fetch Data</button>;
}
```

### Creating Errors Directly

You can also create error objects directly:

```typescript
import { createAppError, ErrorSource, ErrorCategory, ErrorSeverity } from '../utils/error-handler';

// Create an error object
const error = createAppError('Failed to load user profile', {
  source: ErrorSource.API,
  category: ErrorCategory.RESOURCE_NOT_FOUND,
  severity: ErrorSeverity.ERROR,
  code: 'USER_PROFILE_NOT_FOUND',
  metadata: { userId: '12345' }
});
```

### Wrapping Async Functions with Error Handling

```typescript
import { useErrorHandler, ErrorSource, ErrorCategory } from '../utils/error-handler';

function UserProfile({ userId }) {
  const { withErrorHandling } = useErrorHandler();
  
  // Wrap the async function with error handling
  const fetchUserSafely = withErrorHandling(
    async (id) => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    {
      source: ErrorSource.API,
      category: ErrorCategory.RESOURCE_NOT_FOUND,
      code: 'USER_FETCH_FAILED',
      metadata: { userId }
    }
  );
  
  // Now you can call it without try/catch
  const handleFetchUser = async () => {
    const user = await fetchUserSafely(userId);
    // If there's an error, it will be automatically handled
  };
  
  return <button onClick={handleFetchUser}>Load User</button>;
}
```

### Using Error Boundaries

For React component errors, you can use the error boundary wrapper:

```tsx
import { withErrorBoundary } from '../utils/error-handler';

function UserProfile({ userId }) {
  // Component implementation
}

// Wrap the component with an error boundary
export default withErrorBoundary(
  UserProfile,
  <div>Something went wrong loading the user profile. Please try again.</div>,
  (error, info) => {
    console.error('Error in UserProfile component:', error, info);
  }
);
```

## API Error Handling

For API errors, you can use the transformation helper:

```typescript
import { transformApiError, useErrorHandler } from '../utils/error-handler';

function DataFetcher() {
  const { logError, showErrorToUser } = useErrorHandler();
  
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data');
      return response.data;
    } catch (error) {
      // Transform Axios error to app error format
      const appError = transformApiError(error);
      
      // Log and show to user
      logError(appError);
      showErrorToUser(appError);
      
      // Rethrow or handle as needed
      throw appError;
    }
  };
  
  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Best Practices

### 1. Be Specific with Error Categories

Choose the most specific error category and source to help with debugging and analytics:

```typescript
// GOOD: Specific error categorization
captureError(error, {
  source: ErrorSource.API,
  category: ErrorCategory.AUTHENTICATION,
  code: 'INVALID_TOKEN'
});

// BAD: Generic categorization
captureError(error, {
  source: ErrorSource.UNKNOWN,
  category: ErrorCategory.UNKNOWN
});
```

### 2. Include Useful Metadata

Add contextual information to help with debugging:

```typescript
captureError(error, {
  // ...
  metadata: {
    userId: '12345',
    requestId: 'abcd-1234-efgh-5678',
    component: 'UserProfileForm',
    attemptCount: 3
  }
});
```

### 3. Use Appropriate Severity Levels

Match severity levels to the actual impact of the error:

```typescript
// Minor issue - just a warning
captureError(error, {
  severity: ErrorSeverity.WARNING,
  // ...
});

// Critical issue that prevents core functionality
captureError(error, {
  severity: ErrorSeverity.CRITICAL,
  // ...
});
```

### 4. Provide Retry Functions When Possible

If an operation can be retried, include a retry function:

```typescript
captureError(error, {
  // ...
  retry: async () => {
    // Logic to retry the failed operation
    return await fetchDataAgain();
  }
});
```

### 5. Use Error Boundaries for Component-Level Errors

For UI rendering errors, use error boundaries to prevent the entire app from crashing:

```tsx
// Wrap critical components with error boundaries
const ProfileSection = withErrorBoundary(
  UserProfile,
  <FallbackUI onRetry={() => window.location.reload()} />
);
```

## Integration with Analytics

The error handling system automatically integrates with the application's analytics service:

```typescript
// This happens automatically when logError or showErrorToUser is called
trackError(appError);

// Which sends data to the analytics service
window.analyticsService.trackEvent('error_captured', {
  message: error.message,
  code: error.code,
  source: error.source,
  category: error.category,
  severity: error.severity,
  // ...
});
```

## Error Reporting in Production

In production environments, errors should be:

1. Logged to a server-side error tracking service
2. Displayed to users in a friendly manner
3. Reported to developers for investigation

Example production setup:

```typescript
// In your API error handlers
import { captureError } from '../utils/error-handler';
import { reportToErrorTracking } from '../services/error-tracking';

async function handleApiRequest(req, res) {
  try {
    // API logic
  } catch (error) {
    const appError = captureError(error, {
      source: ErrorSource.API,
      // ...
    });
    
    // Log locally
    console.error(appError);
    
    // Report to error tracking service
    reportToErrorTracking(appError);
    
    // Send appropriate response to client
    res.status(500).json({
      error: {
        message: 'An error occurred processing your request',
        code: appError.code,
        requestId: req.headers['x-request-id']
      }
    });
  }
}
```

## Testing Error Handling

When writing tests, you can mock the error handler:

```typescript
import { ErrorHandlerProvider } from '../utils/error-handler';

// Mock error handler for testing
const mockErrorHandler = {
  captureError: vi.fn(),
  logError: vi.fn(),
  showErrorToUser: vi.fn(),
  // ...
};

// In your test
test('component shows error on fetch failure', async () => {
  // Mock fetch to throw an error
  fetch.mockRejectedValueOnce(new Error('Network error'));
  
  render(
    <ErrorHandlerProvider value={mockErrorHandler}>
      <ComponentUnderTest />
    </ErrorHandlerProvider>
  );
  
  // Trigger the action that causes the fetch
  fireEvent.click(screen.getByText('Fetch Data'));
  
  // Verify error handling
  expect(mockErrorHandler.captureError).toHaveBeenCalled();
  expect(mockErrorHandler.showErrorToUser).toHaveBeenCalled();
});
```

## Conclusion

Following these guidelines ensures consistent error handling across the application, improves user experience, and helps with debugging and maintenance. Proper error handling is a critical part of building a robust, reliable application.

## API Reference

| Method | Description |
|--------|-------------|
| `captureError(error, options)` | Creates a standardized error object |
| `logError(error)` | Logs an error |
| `showErrorToUser(error)` | Displays an error to the user |
| `clearErrors()` | Clears error history |
| `getRecentErrors()` | Gets recent errors for analysis |
| `trackError(error)` | Tracks an error with analytics |
| `withErrorHandling(fn, options)` | Wraps a function with error handling |
| `createAppError(message, options)` | Creates an error object directly |
| `transformApiError(error)` | Transforms API errors to app errors |
| `withErrorBoundary(Component, fallback?, onError?)` | Creates an error boundary around a component | 