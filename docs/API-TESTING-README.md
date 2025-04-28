# API Testing in Vibewell

This document outlines the approach and methodologies for testing API services in the Vibewell project.

## Architecture Overview

The API testing infrastructure consists of these key components:

1. **API Client**: A standardized client for making HTTP requests
2. **Service Implementations**: Organized by domain (booking, profile, etc.)
3. **Mock Service Worker (MSW)**: For mocking API responses
4. **Test Utilities**: Helper functions for common testing tasks

## Testing Components

### 1. API Client (`src/services/api-client.ts`)

The API client provides a consistent interface for all API calls with:

- Standardized error handling
- Type-safe responses
- Request/response formatting
- HTTP method abstractions (GET, POST, PUT, etc.)

Example usage:

```typescript
// Using the API client
const response = await apiClient.get<User>('/api/users/123');

// Type-safe response handling
if (response.success) {
  const user = response.data;  // Typed as User
} else {
  console.error(response.error);
}
```

### 2. Service Implementations

Each service is organized by domain with strongly typed interfaces:

```typescript
// A service implementation
export const bookingService = {
  async getBookings(): Promise<ApiResponse<Booking[]>> {
    return apiClient.get<Booking[]>('/api/bookings');
  },
  
  async createBooking(data: CreateBookingParams): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>('/api/bookings', data);
  }
};
```

### 3. Mock Service Worker (MSW)

MSW is used to intercept and mock API requests during tests:

```typescript
// Setting up a mock response
server.use(
  http.get('/api/bookings', () => {
    return HttpResponse.json(mockBookings);
  })
);
```

### 4. Testing Utilities

The `server.ts` file provides common testing utilities:

- `server`: The MSW server instance
- `apiMock`: Utilities for managing mock responses
- `commonHandlers`: Default API mock handlers

## Writing API Tests

### 1. Basic Test Structure

```typescript
describe('Service Name', () => {
  // Setup mock server
  beforeAll(() => {
    apiMock.start();
  });

  afterAll(() => {
    apiMock.stop();
  });

  // Reset handlers between tests
  afterEach(() => {
    apiMock.reset();
  });

  describe('methodName', () => {
    it('should perform expected behavior', async () => {
      // Setup mock response
      server.use(
        http.get('/api/endpoint', () => {
          return HttpResponse.json(mockData);
        })
      );
      
      // Execute the service call
      const response = await someService.someMethod();
      
      // Assertions
      expect(response.success).toBeTruthy();
      expect(response.data).toBeTruthy();
    });
  });
});
```

### 2. Testing Error Cases

```typescript
it('should handle error cases', async () => {
  // Setup error response
  server.use(
    http.get('/api/endpoint', () => {
      return new HttpResponse(
        JSON.stringify({ message: 'Error message' }),
        { status: 400 }
      );
    })
  );
  
  // Execute the service call
  const response = await someService.someMethod();
  
  // Assertions
  expect(response.success).toBeFalsy();
  expect(response.status).toBe(400);
});
```

### 3. Testing Request Validation

```typescript
it('should validate request parameters', async () => {
  // Setup mock to test request validation
  server.use(
    http.post('/api/endpoint', async ({ request }) => {
      const body = await request.json();
      
      // Return different responses based on request data
      if (!body.requiredField) {
        return new HttpResponse(
          JSON.stringify({ message: 'Missing required field' }),
          { status: 400 }
        );
      }
      
      return HttpResponse.json({ success: true });
    })
  );
  
  // Test with invalid data
  const invalidResponse = await someService.someMethod({});
  expect(invalidResponse.success).toBeFalsy();
  
  // Test with valid data
  const validResponse = await someService.someMethod({ requiredField: 'value' });
  expect(validResponse.success).toBeTruthy();
});
```

## Best Practices

1. **Test both success and error cases**: Ensure your tests cover successful operations as well as various error conditions.

2. **Verify request parameters**: Test that your services correctly format and send request parameters.

3. **Test request transformations**: Verify that request data is properly transformed before sending to the API.

4. **Test response handling**: Check that responses are correctly parsed and transformed into the expected format.

5. **Test edge cases**: Include tests for empty responses, large data sets, and unexpected data structures.

6. **Keep tests isolated**: Each test should reset the mock server to ensure independence between tests.

7. **Use descriptive test names**: Test names should clearly describe the expected behavior being tested.

## Adding New API Tests

To add tests for a new API service:

1. Create a service implementation file (e.g., `src/services/new-service.ts`)
2. Define interfaces for request and response data
3. Implement service methods using the api-client
4. Create a test file (e.g., `src/services/new-service.test.ts`)
5. Set up mock responses for each API endpoint
6. Write tests for success and error cases

## Running API Tests

To run API tests:

```bash
# Run all tests with the enhanced configuration
npm run test:enhanced

# Run tests for a specific service
npm run test:enhanced -- --testPathPattern=src/services/booking-service
``` 