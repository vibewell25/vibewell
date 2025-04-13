# Type-Safe API Usage Guide

This guide explains how to use the type-safe API utilities and services in the Vibewell application, with a focus on the booking service as an example.

## Overview

The type-safe API utilities provide a consistent way to handle API responses with proper TypeScript type safety. This ensures that your code handles both success and error cases appropriately, with full type checking.

## Key Components

### 1. `ApiResponse<T>` Interface

This is the standard response format for all API calls:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}
```

### 2. Type Guard Utilities

These utilities help TypeScript correctly narrow types:

- `hasData<T>(response)`: Checks if a response has data and narrows the type accordingly
- `hasError<T>(response)`: Checks if a response has an error and narrows the type accordingly
- `isSuccessResponse<T>(response)`: Checks if a response was successful
- `getResponseData<T>(response, defaultValue)`: Safely retrieves data with a fallback
- `getResponseError<T>(response, defaultError)`: Safely retrieves error message with a fallback

### 3. Enhanced API Services

Each service has a standard version and a type-safe version:

- Standard service (e.g., `bookingService`): Basic API calls
- Type-safe service (e.g., `typeSafeBookingService`): Wrapped with error handling utilities

## Usage Examples

### Basic Data Fetching

```typescript
import { typeSafeBookingService } from '../services/booking-service';
import { hasData, hasError } from '../utils/api-response-utils';

async function fetchBooking(id: string) {
  const response = await typeSafeBookingService.getBooking(id);
  
  if (hasData(response)) {
    // TypeScript knows response.data is defined here
    const booking = response.data;
    return booking;
  } else if (hasError(response)) {
    // TypeScript knows response.error is defined here
    throw new Error(response.error);
  }
  
  // Handle other cases
  return null;
}
```

### Using handleResponse Utility

```typescript
import { typeSafeBookingService } from '../services/booking-service';
import { handleResponse } from '../utils/api-response-utils';

async function fetchBookingNames() {
  const response = await typeSafeBookingService.getBookings();
  
  return handleResponse(
    response,
    (bookings) => bookings.map(b => b.serviceName), // Success handler
    (error) => {
      console.error(error);
      return []; // Error handler
    }
  );
}
```

### With Error Handler Integration

```typescript
import { typeSafeBookingService } from '../services/booking-service';
import { hasData, hasError } from '../utils/api-response-utils';
import { useErrorHandler } from '../utils/error-handler';
import { ErrorCategory, ErrorSource } from '../utils/error-handler';

function MyComponent() {
  const { captureError, showErrorToUser, createError } = useErrorHandler();
  
  const handleFetchBooking = async (id: string) => {
    try {
      const response = await typeSafeBookingService.getBooking(id);
      
      if (hasData(response)) {
        // Process data
        return response.data;
      } else if (hasError(response)) {
        const error = createError(response.error, {
          severity: 'error',
          source: ErrorSource.API,
          category: ErrorCategory.API
        });
        showErrorToUser(error);
      }
    } catch (error) {
      captureError(error instanceof Error ? error : String(error), {
        category: ErrorCategory.API,
        source: ErrorSource.API
      });
    }
    
    return null;
  };

  // Component JSX...
}
```

## Best Practices

1. **Always check for data presence**: Use `hasData` or `isSuccessResponse` before accessing response data.

2. **Provide fallbacks**: When using `getResponseData` or similar utilities, always provide a reasonable default value.

3. **Categorize errors properly**: When using the error handler, specify appropriate severity, source, and category.

4. **Type narrowing**: Take advantage of TypeScript's type narrowing with the type guard functions.

5. **Consistent patterns**: Follow the patterns shown in the example components:
   - `BookingList.tsx`: List view with filtering and selection
   - `BookingDetail.tsx`: Detail view for a single item
   - `BookingApp.tsx`: Container component integrating multiple views

## Error Handling Strategy

The recommended approach for handling API errors is:

1. Use the type-safe service version (e.g., `typeSafeBookingService`)
2. Check for data/errors using type guards
3. For unexpected errors:
   - Capture the error with appropriate metadata
   - Show user-friendly messages
   - Log errors for debugging

## Common Patterns

### GET Request with Filtering

```typescript
const response = await typeSafeBookingService.getBookings({ 
  status: 'confirmed',
  providerId: currentProvider
});
```

### Creating New Items

```typescript
const response = await typeSafeBookingService.createBooking({
  serviceId: selectedService.id,
  providerId: selectedProvider.id,
  date: selectedDate,
  time: selectedTime,
  customerName: formData.name,
  customerEmail: formData.email
});
```

### Updating Items

```typescript
const response = await typeSafeBookingService.updateBooking({
  id: booking.id,
  notes: updatedNotes,
  date: newDate,
  time: newTime
});
```

## See Also

- [Error Handling Documentation](../utilities/error-handling.md)
- [API Client Documentation](../api/api-client.md)
- [Type Guards Documentation](../utilities/type-guards.md) 