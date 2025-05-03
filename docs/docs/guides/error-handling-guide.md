# Error Handling Guide

## Overview

This guide outlines the standardized approach to error handling across the VibeWell platform. Consistent error handling improves code quality, enhances user experience, and facilitates debugging and maintenance.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Error Handler Utility](#error-handler-utility)
3. [Error Categories](#error-categories)
4. [Error Boundaries](#error-boundaries)
5. [API Error Handling](#api-error-handling)
6. [Form Validation Errors](#form-validation-errors)
7. [Logging and Monitoring](#logging-and-monitoring)
8. [User-Facing Error Messages](#user-facing-error-messages)
9. [Testing Error Scenarios](#testing-error-scenarios)
10. [Best Practices](#best-practices)

## Core Principles

1. **Be Specific**: Categorize errors appropriately for better debugging and analytics
2. **Be Informative**: Include useful metadata with errors to aid debugging
3. **Be User-Friendly**: Show appropriate, helpful messages to users
4. **Be Secure**: Never expose sensitive information in error messages
5. **Be Consistent**: Use standardized error handling patterns across the application

## Error Handler Utility

The VibeWell platform uses a centralized error handling utility located at `src/utils/error-handler.ts`. This utility provides a consistent interface for capturing, logging, and displaying errors throughout the application.

### Basic Usage

```tsx
import { useErrorHandler } from '@/utils/error-handler';

function MyComponent() {
  const { captureError, showErrorToUser } = useErrorHandler();
  
  const handleSubmit = async (data) => {
    try {
      await submitData(data);
    } catch (error) {
      // Capture the error with additional context
      captureError(error, {
        source: ErrorSource.API,
        category: ErrorCategory.DATA_SUBMISSION,
        severity: ErrorSeverity.ERROR,
        metadata: { formData: data }
      });
      
      // Show a user-friendly error message
      showErrorToUser(error);
    }
  };
  
  return (
    // Component JSX
  );
}
```

## Error Categories

Properly categorizing errors helps with debugging, analytics, and creating appropriate user experiences. Use the following enums for categorization:

### Error Severity

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
  UI = 'ui',              // User interface errors
  API = 'api',            // API request/response errors
  DATABASE = 'database',  // Database operations errors
  AUTH = 'auth',          // Authentication/authorization errors
  VALIDATION = 'validation', // Input validation errors
  EXTERNAL = 'external',   // Errors from external services
  UNKNOWN = 'unknown'      // Unclassified errors
}
```

### Error Categories

```typescript
enum ErrorCategory {
  NETWORK = 'network',        // Network connectivity issues
  AUTHENTICATION = 'auth',     // Login/session problems
  AUTHORIZATION = 'authz',     // Permission issues
  DATA_SUBMISSION = 'submit',  // Form submission errors
  DATA_FETCHING = 'fetch',     // Data retrieval errors
  USER_INPUT = 'input',        // Invalid user input
  RENDERING = 'render',        // UI rendering problems
  RESOURCE_ACCESS = 'resource', // Resource availability issues
  TIMEOUT = 'timeout',         // Operation timeout
  UNKNOWN = 'unknown'          // Unclassified errors
}
```

## Error Boundaries

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI.

### Using Error Boundaries

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MainContent />
    </ErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>We've been notified and are working to fix the issue.</p>
      <button onClick={() => window.location.reload()}>Try again</button>
    </div>
  );
}
```

### Higher-Order Component

For components that might cause errors, use the withErrorBoundary HOC:

```tsx
import { withErrorBoundary } from '@/components/ui/error-boundary';

function DataVisualization({ data }) {
  // Component that might throw errors when processing data
  return (
    // JSX for data visualization
  );
}

// Wrap with error boundary and custom fallback
export default withErrorBoundary(DataVisualization, {
  fallback: <DataErrorFallback />,
  onError: (error, info) => logError(error, info)
});
```

## API Error Handling

When making API calls, follow these patterns for consistent error handling:

### With Fetch API

```typescript
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      // Parse error response if available
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Unknown error' };
      }
      
      // Create standardized error
      throw createApiError(
        errorData.message || `Error ${response.status}`,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    // Transform into a standardized format
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createApiError('Request was aborted', 0, { type: 'abort' });
    }
    
    if (!error.status) {
      throw createApiError('Network error', 0, { originalError: error });
    }
    
    throw error;
  }
}
```

### With React Query

```typescript
import { useQuery } from 'react-query';
import { useErrorHandler } from '@/utils/error-handler';

function UserProfile({ userId }) {
  const { captureError } = useErrorHandler();
  
  const { data, error, isLoading } = useQuery(
    ['user', userId],
    () => fetchUserData(userId),
    {
      onError: (error) => {
        captureError(error, {
          source: ErrorSource.API,
          category: ErrorCategory.DATA_FETCHING,
          metadata: { userId }
        });
      }
    }
  );
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    // User profile UI
  );
}
```

## Form Validation Errors

For form validation errors, leverage the standardized form validation utilities:

```typescript
import { z } from 'zod';
import { validateForm, CommonSchemas } from '@/utils/form-validation-zod';
import { useErrorHandler } from '@/utils/error-handler';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const { captureError } = useErrorHandler();
  
  const schema = z.object({
    name: CommonSchemas.name,
    email: CommonSchemas.email,
    message: z.string().min(10, 'Message must be at least 10 characters')
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateForm(formData, schema);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      await submitContactForm(formData);
      // Success handling
    } catch (error) {
      captureError(error, {
        source: ErrorSource.API,
        category: ErrorCategory.DATA_SUBMISSION,
        metadata: { formData }
      });
      
      setErrors({ form: 'Failed to submit form. Please try again.' });
    }
  };
  
  // Form JSX
}
```

## Logging and Monitoring

Errors should be logged consistently to facilitate troubleshooting and monitoring:

```typescript
import { logger } from '@/utils/logger';
import { captureToErrorTracking } from '@/utils/error-tracking';

// In your error handler utility
export function logError(error, metadata = {}) {
  const errorId = generateErrorId();
  
  // Log locally
  logger.error('Application error', {
    errorId,
    message: error.message,
    stack: error.stack,
    ...metadata
  });
  
  // Send to error tracking service (only in production)
  if (process.env.NODE_ENV === 'production') {
    captureToErrorTracking(error, { errorId, ...metadata });
  }
  
  return errorId; // Return ID for reference in UI
}
```

## User-Facing Error Messages

When displaying errors to users, follow these guidelines:

1. **Be Clear**: Use plain language that explains what happened
2. **Be Helpful**: Suggest actions the user can take
3. **Be Consistent**: Use standard error components
4. **Be Respectful**: Never blame the user
5. **Be Secure**: Never expose sensitive details

### Error Display Components

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function ErrorAlert({ title, message, variant = 'error' }) {
  return (
    <Alert variant={variant}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// Usage
function CheckoutForm() {
  // Form logic
  
  return (
    <form>
      {error && (
        <ErrorAlert 
          title="Payment Error" 
          message="We couldn't process your payment. Please check your card details and try again."
        />
      )}
      {/* Form fields */}
    </form>
  );
}
```

## Testing Error Scenarios

Always test how your application handles errors:

```typescript
// Example test for error handling
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import UserProfile from '@/components/UserProfile';

// Mock server
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Server error' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays error message when API fails', async () => {
  render(<UserProfile userId="123" />);
  
  // Wait for error state to appear
  await waitFor(() => {
    expect(screen.getByText(/couldn't load profile/i)).toBeInTheDocument();
  });
  
  // Check that retry button is present
  expect(screen.getByText(/try again/i)).toBeInTheDocument();
});
```

## Best Practices

1. **Never swallow errors** without proper handling or logging.
2. **Use try/catch blocks** around operations that might fail.
3. **Implement error boundaries** at appropriate levels in your component tree.
4. **Be specific with error types** to improve debuggability.
5. **Include useful context** when capturing errors.
6. **Show user-friendly messages** that guide users toward solutions.
7. **Log errors on the server** to maintain a record of issues.
8. **Implement retry mechanisms** where appropriate.
9. **Maintain sensible fallbacks** for degraded functionality.
10. **Update error handling patterns** as the application evolves.

### Do's and Don'ts

#### Do ✅

- Categorize errors appropriately
- Include metadata that helps with debugging
- Display user-friendly error messages
- Implement error boundaries to prevent app crashes
- Log errors for later analysis

#### Don't ❌

- Expose sensitive information in error messages
- Swallow errors without handling them
- Use generic error messages that don't help users
- Let errors cascade through the application
- Mix error handling patterns across the codebase

## Conclusion

Consistent error handling is crucial for maintaining a robust application. By following these guidelines, the VibeWell platform can provide a better user experience while facilitating debugging and maintenance for developers.

## Related Documentation

- [Testing Guide](./testing-guide.md)
- [Form Validation Guide](./form-validation-standardization-guide.md)
- [Accessibility Guide](./accessibility-guide.md) 