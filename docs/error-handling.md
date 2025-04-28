# Error Handling Guide

This guide explains the error handling approach used in the Vibewell application, including error boundaries, fallback UI components, best practices, and the error handling system.

## Error Boundaries

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

### Using the ErrorBoundary Component

The `ErrorBoundary` component can be used to wrap any part of your application that you want to protect from crashes:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <SomeComponentThatMightCrash />
    </ErrorBoundary>
  );
}
```

#### Props

The `ErrorBoundary` component accepts the following props:

- `children`: The components to be rendered inside the error boundary.
- `fallback` (optional): A custom fallback UI to display when an error occurs.
- `onReset` (optional): A function to call when the error boundary is reset.
- `onError` (optional): A function to call when an error is caught.

### Using the withErrorBoundary HOC

For a more declarative approach, you can use the `withErrorBoundary` higher-order component:

```tsx
import { withErrorBoundary } from '@/components/ui/error-boundary';

function MyComponent() {
  // Component code
}

export default withErrorBoundary(MyComponent);
```

This HOC wraps your component with an error boundary, making it easier to add error handling to multiple components.

## Fallback UI Components

The application includes several fallback UI components to display during loading states or when an error occurs:

### Fallback Component

The basic `Fallback` component shows a loading spinner and a message:

```tsx
import { Fallback } from '@/components/ui/fallback';

function LoadingView() {
  return <Fallback message="Loading your profile..." />;
}
```

### Specialized Fallbacks

There are also specialized fallback components for different UI patterns:

- `CardFallback`: Shows a placeholder for card components.
- `TableFallback`: Shows a placeholder for tables.
- `ProfileFallback`: Shows a placeholder for user profiles.

```tsx
import { CardFallback, TableFallback, ProfileFallback } from '@/components/ui/fallback';

function LoadingState() {
  return (
    <div>
      <CardFallback count={3} />
      <TableFallback rows={5} columns={4} />
      <ProfileFallback />
    </div>
  );
}
```

## Error Handling System

The Vibewell error handling system provides a standardized way to manage errors throughout the application. It offers:
- **Standardized Error Structure**: A consistent format for all errors
- **Centralized Error Logging**: A unified approach to capturing and recording errors
- **Contextual Error Display**: Appropriate error messages for users based on error severity
- **Error Analytics**: Tracking and analysis of error patterns
- **Error Recovery**: Mechanisms for retry and recovery when possible

### ErrorHandlerProvider
```tsx
import { ErrorHandlerProvider } from '@/utils/error-handler';
// In your app's root component
<ErrorHandlerProvider>
  {/* Your application components */}
</ErrorHandlerProvider>
```

### useErrorHandler Hook
```tsx
import { useErrorHandler } from '@/utils/error-handler';

function MyComponent() {
  const { captureError, showErrorToUser } = useErrorHandler();
  // Use these functions in your component
}
```

### Error Severity Levels
- **Low**: Non-critical issues (e.g., UI glitches)
- **Medium**: Recoverable errors (e.g., network failures)
- **High**: Critical errors requiring immediate attention
- **Fatal**: Unrecoverable errors (e.g., data corruption)

## Best Practices

### Error Boundary Placement

Place error boundaries strategically:

1. **Route-level boundaries**: Wrap each route component to prevent navigation failures.
2. **Feature-level boundaries**: Wrap independent features so failures don't affect the entire page.
3. **Critical component boundaries**: Wrap components that interact with external services.

### Error Reporting

When an error occurs, it should be reported to a monitoring service:

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to your error reporting service
    reportError(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Recovery Strategies

Provide users with clear recovery options:

1. **Retry**: Allow users to retry the failed operation.
2. **Reset**: Clear any problematic state and start fresh.
3. **Navigate away**: Provide links to navigate to a safe part of the application.

## Error Types and Handling Strategies

### Network Errors

For network-related errors, implement retry logic with exponential backoff:

```tsx
async function fetchWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP error ${response.status}`);
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
}
```

### Validation Errors

For form validation errors, display clear error messages near the relevant fields:

```tsx
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Please enter a valid email address';
}
```

### Authentication Errors

When authentication errors occur, redirect to the login page with an appropriate message:

```tsx
if (error.code === 'auth/invalid-session') {
  router.push(`/login?error=${encodeURIComponent('Your session has expired. Please log in again.')}`);
}
```

## Conclusion

A robust error handling strategy improves user experience by:

1. Preventing application crashes
2. Providing meaningful feedback to users
3. Offering clear recovery paths
4. Ensuring issues are properly logged and tracked

By using error boundaries, fallback UI components, and the error handling system consistently throughout the application, we create a more resilient and user-friendly experience.