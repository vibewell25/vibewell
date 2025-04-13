# Error Handling Example Components

This document provides details about the example components that demonstrate the recommended approaches for error handling in the Vibewell platform.

## Overview

We've created two example components to showcase different aspects of error handling:

1. **ErrorHandlingExample** - A basic demonstration of various error handling techniques
2. **ProductDataFetcher** - A practical example showing error handling in a real-world API context

These examples illustrate the best practices described in the main [Error Handling System](./error-handling.md) documentation.

## ErrorHandlingExample Component

Located at: `src/components/examples/ErrorHandlingExample.tsx`

This component showcases fundamental error handling techniques:

- Direct error creation with specific categories and severities
- Capturing existing Error objects
- Adding metadata to errors
- Implementing retry functionality
- Using different severity levels
- Wrapping async functions with error handling

### Key Patterns Demonstrated

```tsx
// Direct error creation with specific category and severity
const error = captureError('This is a basic error example', {
  source: ErrorSource.UI,
  category: ErrorCategory.CLIENT,
  severity: ErrorSeverity.WARNING
});

// Capturing an existing Error object
try {
  throw new Error('This is a simulated existing error');
} catch (error) {
  const appError = captureError(error as Error, {
    source: ErrorSource.UI,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.ERROR
  });
}

// Error with metadata and retry function
const error = captureError('Failed to process data', {
  source: ErrorSource.API,
  category: ErrorCategory.TIMEOUT,
  severity: ErrorSeverity.WARNING,
  metadata: {
    attemptCount: retryCount,
    timestamp: new Date().toISOString(),
    component: 'ErrorHandlingExample'
  },
  retry: retryFunc
});

// Wrapping an async function with error handling
const handleWrappedAsync = withErrorHandling(fetchDataAsync, {
  source: ErrorSource.API,
  category: ErrorCategory.SERVER,
  severity: ErrorSeverity.ERROR
});
```

## ProductDataFetcher Component

Located at: `src/components/examples/ProductDataFetcher.tsx`

This component demonstrates error handling in a more practical scenario - fetching product data from an API. It shows how to:

- Handle API response errors based on HTTP status codes
- Categorize errors appropriately
- Implement retry functionality for failed requests
- Handle network errors
- Create error boundaries for component-level protection
- Show loading states and fallback UIs

### Key Patterns Demonstrated

```tsx
// Fetch with proper error handling using withErrorHandling HOF
const fetchProducts = withErrorHandling(async () => {
  // Implementation...
  if (!response.ok) {
    // Handle specific HTTP error codes
    if (response.status === 404) {
      throw new Error('Products not found');
    } else if (response.status === 401) {
      throw new Error('Unauthorized access to products');
    }
    // ...
  }
}, {
  source: ErrorSource.API,
  category: ErrorCategory.RESOURCE_NOT_FOUND,
  severity: ErrorSeverity.WARNING,
  metadata: {
    component: 'ProductDataFetcher',
    endpoint: '/api/products'
  }
});

// Custom error handling for network errors
try {
  // Implementation...
} catch (error) {
  // Determine the appropriate error category based on the error
  let category = ErrorCategory.UNKNOWN;
  
  if (errorMessage.includes('not found')) {
    category = ErrorCategory.RESOURCE_NOT_FOUND;
  } else if (errorMessage.includes('timed out')) {
    category = ErrorCategory.TIMEOUT;
  }
  // ...
  
  // Create a retry function
  const retry = () => fetchProductById(id);
  
  // Capture and handle the error
  const appError = captureError(error as Error, {
    source: ErrorSource.API,
    category,
    severity,
    metadata: { /* ... */ },
    retry
  });
}
```

## Using Error Boundaries

Both example components demonstrate the use of error boundaries for component-level error handling:

```tsx
// Wrap the component with an error boundary
export const ProductDataFetcher = withErrorBoundary(ProductDataFetcherComponent, {
  fallback: (
    <div className="p-6 border rounded-lg bg-red-50">
      <h3 className="text-lg font-medium text-red-800">Error Loading Products</h3>
      <p className="text-red-600 mt-2">
        We couldn't load the product data. Please try refreshing the page.
      </p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  ),
  onError: (error) => {
    console.error('Product component error:', error);
    // You could send this to your monitoring service
  }
});
```

## Best Practices Illustrated

These examples showcase the following best practices:

1. **Be Specific with Error Categories** - Always choose the most specific error category
2. **Include Useful Metadata** - Add contextual information to help with debugging
3. **Use Appropriate Severity Levels** - Match the severity to the impact on user experience
4. **Provide Retry Functions** - Where appropriate, include retry capabilities
5. **Use Error Boundaries** - Wrap components to prevent cascading failures
6. **Handle Specific Error Types** - Different handling for different types of errors
7. **Consistent Error Structure** - Use the standard error format throughout the application

## Implementing in Your Components

To use these patterns in your own components:

1. Import the necessary utilities:
   ```tsx
   import { useErrorHandler, ErrorSource, ErrorCategory, ErrorSeverity } from '@/utils/error-handler';
   ```

2. Access the error handler in your component:
   ```tsx
   const { captureError, logError, showErrorToUser, withErrorHandling } = useErrorHandler();
   ```

3. Use the appropriate error handling pattern based on your use case.

4. Consider wrapping your component with an error boundary:
   ```tsx
   export default withErrorBoundary(YourComponent);
   ```

## Example Usage in API Calls

For typical API call scenarios, we recommend following the pattern in `ProductDataFetcher`:

1. Use `withErrorHandling` to wrap your API fetch function
2. Handle specific HTTP status codes appropriately
3. Categorize errors based on their nature
4. Include useful metadata about the request
5. Provide retry functionality where appropriate

## Testing Error Handling

When writing tests for components that use the error handling system:

1. Mock the error handler in your tests
2. Trigger various error conditions
3. Verify that errors are captured, logged, and displayed correctly
4. Test that retry functionality works as expected
5. Verify that error boundaries catch and display errors correctly

## Additional Resources

- [Main Error Handling Documentation](./error-handling.md)
- [Error Boundary Documentation](../error-handling.md) 