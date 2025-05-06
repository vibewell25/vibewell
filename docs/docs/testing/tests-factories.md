# Test Factory Usage Guide

This guide demonstrates how to use the `TestFactory` in your component and integration tests.

## Basic Usage

```typescript
import { TestFactory } from './factories/test-factory';

describe('UserProfile', () => {
  beforeEach(() => {
    TestFactory.reset(); // Reset counters before each test
  });

  it('should display user information', () => {
    const user = TestFactory.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    render(<UserProfile user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Component Testing Examples

### Testing a Service List Component

```typescript
describe('ServiceList', () => {
  it('should render a list of available services', () => {
    const services = TestFactory.createManyServices(3, { available: true });
    
    render(<ServiceList services={services} />);
    
    services.forEach(service => {
      expect(screen.getByText(service.name)).toBeInTheDocument();
      expect(screen.getByText(`$${service.price}`)).toBeInTheDocument();
    });
  });

  it('should filter out unavailable services', () => {
    const services = [
      ...TestFactory.createManyServices(2, { available: true }),
      ...TestFactory.createManyServices(1, { available: false })
    ];
    
    render(<ServiceList services={services} showOnlyAvailable={true} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
```

### Testing a Booking Form Component

```typescript
describe('BookingForm', () => {
  it('should pre-fill form with booking data', () => {
    const booking = TestFactory.createBooking({
      date: '2024-12-25T10:00:00Z',
      notes: 'Special requirements'
    });

    render(<BookingForm booking={booking} />);
    
    expect(screen.getByLabelText('Date')).toHaveValue('2024-12-25');
    expect(screen.getByLabelText('Notes')).toHaveValue('Special requirements');
  });
});
```

## Integration Testing Examples

### Testing the Booking Flow

```typescript
describe('Booking Flow Integration', () => {
  it('should allow a client to book a service', async () => {
    // Create test data
    const { provider, services } = TestFactory.createProviderWithServices(1);
    const client = TestFactory.createUser({ role: 'client' });
    
    // Setup mock API responses
    mockApi.onGet('/services').reply(200, services);
    mockApi.onGet('/providers').reply(200, [provider]);
    
    // Start the booking flow
    render(<BookingFlow client={client} />);
    
    // Select a service
    await userEvent.click(screen.getByText(services[0].name));
    
    // Fill booking details
    await userEvent.type(screen.getByLabelText('Notes'), 'Test booking');
    await userEvent.click(screen.getByText('Confirm Booking'));
    
    // Verify booking was created
    expect(mockApi.history.post).toHaveLength(1);
    expect(JSON.parse(mockApi.history.post[0].data)).toMatchObject({
      serviceId: services[0].id,
      userId: client.id,
      status: 'pending'
    });
  });
});
```

### Testing User Management

```typescript
describe('User Management Integration', () => {
  it('should allow admins to manage service providers', async () => {
    // Create test data
    const admin = TestFactory.createUser({ role: 'admin' });
    const providers = TestFactory.createManyUsers(3, { role: 'provider' });
    
    // Setup mock API responses
    mockApi.onGet('/providers').reply(200, providers);
    
    // Render the management interface
    render(<ProviderManagement admin={admin} />);
    
    // Verify providers are listed
    providers.forEach(provider => {
      expect(screen.getByText(provider.name)).toBeInTheDocument();
    });
    
    // Test adding a new provider
    await userEvent.click(screen.getByText('Add Provider'));
    const newProvider = TestFactory.createUser({ 
      role: 'provider',
      name: 'New Provider'
    });
    
    await userEvent.type(screen.getByLabelText('Name'), newProvider.name);
    await userEvent.click(screen.getByText('Save'));
    
    expect(mockApi.history.post).toHaveLength(1);
    expect(JSON.parse(mockApi.history.post[0].data)).toMatchObject({
      name: newProvider.name,
      role: 'provider'
    });
  });
});
```

## Best Practices

1. **Reset Before Each Test**
   ```typescript
   beforeEach(() => {
     TestFactory.reset();
   });
   ```

2. **Use Type Safety**
   ```typescript
   // The factory methods are fully typed
   const user: User = TestFactory.createUser();
   const service: Service = TestFactory.createService();
   ```

3. **Complex Data Relationships**
   ```typescript
   // Create related data in a single call
   const { provider, services } = TestFactory.createProviderWithServices(3);
   const { client, bookings } = TestFactory.createClientWithBookings(2);
   ```

4. **Custom Overrides**
   ```typescript
   const premiumService = TestFactory.createService({
     category: 'premium',
     price: 199.99,
     duration: 120
   });
   ```

5. **Bulk Creation**
   ```typescript
   const users = TestFactory.createManyUsers(5, { 
     preferences: { notifications: true } 
   });
   ```

## Tips for Testing

1. Use `TestFactory.reset()` in `beforeEach` to ensure a clean state
2. Create only the data you need for each test
3. Use type annotations to catch errors early
4. Leverage the factory's override capability for edge cases
5. Use the complex scenario creators for related data
6. Keep test data consistent with your test configuration 

## Advanced Testing Scenarios

### Testing Real-time Updates

```typescript
describe('ServiceAvailabilityMonitor', () => {
  it('should update service status in real-time', async () => {
    // Create initial service data
    const service = TestFactory.createService({ available: true });
    const provider = TestFactory.createUser({ role: 'provider' });
    
    // Mock WebSocket connection
    const mockSocket = new MockWebSocket();
    
    render(<ServiceAvailabilityMonitor 
      service={service} 
      provider={provider}
      socket={mockSocket}
    />);

    // Verify initial state
    expect(screen.getByText('Available')).toBeInTheDocument();

    // Simulate real-time update
    await mockSocket.emit('service:update', {
      ...service,
      available: false
    });

    // Verify updated state
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
```

### Testing Error Scenarios

```typescript
describe('BookingErrorHandling', () => {
  it('should handle service unavailability gracefully', async () => {
    const { client, bookings } = TestFactory.createClientWithBookings(1);
    const service = TestFactory.createService({ 
      available: false,
      name: 'Premium Service'
    });

    // Mock failed API response
    mockApi.onPost('/bookings').reply(409, {
      error: 'Service no longer available',
      serviceId: service.id
    });

    render(<BookingForm client={client} service={service} />);
    
    await userEvent.click(screen.getByText('Book Now'));

    // Verify error handling
    expect(screen.getByText(/Service no longer available/i)).toBeInTheDocument();
    expect(screen.getByText(/Please choose another time/i)).toBeInTheDocument();
  });
});
```

## API Testing Examples

### Testing REST Endpoints

```typescript
describe('API Endpoints', () => {
  describe('GET /services', () => {
    it('should return filtered services by category', async () => {
      // Create test data
      const services = [
        ...TestFactory.createManyServices(2, { category: 'spa' }),
        ...TestFactory.createManyServices(3, { category: 'fitness' })
      ];

      // Setup mock database
      await db.services.bulkCreate(services);

      // Make API request
      const response = await request(app)
        .get('/api/services')
        .query({ category: 'spa' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].category).toBe('spa');
    });
  });

  describe('POST /bookings', () => {
    it('should create a booking with related notifications', async () => {
      const { client, bookings } = TestFactory.createClientWithBookings(0);
      const service = TestFactory.createService();

      const response = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: service.id,
          userId: client.id,
          date: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      
      // Verify notification was created
      const notification = await db.notifications.findOne({
        where: { bookingId: response.body.id }
      });
      expect(notification).toBeDefined();
    });
  });
});
```

### Testing GraphQL Queries

```typescript
describe('GraphQL Queries', () => {
  it('should fetch provider schedule with services', async () => {
    // Create test data
    const { provider, services } = TestFactory.createProviderWithServices(3);
    const bookings = TestFactory.createManyBookings(2, {
      serviceId: services[0].id,
      userId: provider.id
    });

    const query = gql`
      query ProviderSchedule($providerId: ID!) {
        provider(id: $providerId) {
          services {
            id
            name
            bookings {
              date
              status
            }
          }
        }
      }
    `;

    const response = await graphqlRequest({
      query,
      variables: { providerId: provider.id }
    });

    expect(response.data.provider.services).toHaveLength(3);
    expect(response.data.provider.services[0].bookings).toHaveLength(2);
  });
});
```

## Testing with Multiple Data Sets

### Scenario-based Testing

```typescript
describe('Business Rules', () => {
  it('should apply peak hour pricing', () => {
    // Create different service tiers
    const services = {
      standard: TestFactory.createService({ category: 'standard', price: 50 }),
      premium: TestFactory.createService({ category: 'premium', price: 100 }),
      vip: TestFactory.createService({ category: 'vip', price: 200 })
    };

    // Create bookings at different times
    const peakHourBooking = TestFactory.createBooking({
      serviceId: services.standard.id,
      date: '2024-03-15T18:00:00Z' // Peak hour
    });

    const offPeakBooking = TestFactory.createBooking({
      serviceId: services.standard.id,
      date: '2024-03-15T11:00:00Z' // Off-peak
    });

    const pricingService = new PricingService();
    
    // Test peak hour pricing
    expect(pricingService.calculatePrice(peakHourBooking)).toBe(75); // 50% premium
    expect(pricingService.calculatePrice(offPeakBooking)).toBe(50); // Standard price
  });
});
```

## Tips for Advanced Testing

1. **Data Consistency**
   ```typescript
   // Create a consistent test dataset
   const setupTestData = () => {
     const baseData = {
       provider: TestFactory.createUser({ role: 'provider' }),
       services: TestFactory.createManyServices(3),
       clients: TestFactory.createManyUsers(5, { role: 'client' })
     };

     return {
       ...baseData,
       bookings: TestFactory.createManyBookings(3, {
         serviceId: baseData.services[0].id,
         userId: baseData.clients[0].id
       })
     };
   };
   ```

2. **Testing Edge Cases**
   ```typescript
   // Test boundary conditions
   const testBookingLimits = () => {
     const maxBookings = TEST_CONFIG.MAX_TEST_BOOKINGS;
     const overloadedProvider = TestFactory.createProviderWithServices(1);
     
     // Create maximum allowed bookings
     const bookings = TestFactory.createManyBookings(maxBookings + 1, {
       serviceId: overloadedProvider.services[0].id
     });

     // Verify system handles overload
     expect(() => validateBookingLimit(bookings)).toThrow();
   };
   ```

3. **Cleanup Patterns**
   ```typescript
   describe('Resource Management', () => {
     let testData;

     beforeEach(async () => {
       TestFactory.reset();
       testData = setupTestData();
       await db.sync();
     });

     afterEach(async () => {
       await cleanup();
       jest.clearAllMocks();
     });
   });
   ```

Remember to:
- Use meaningful data that reflects real-world scenarios
- Test both success and failure paths
- Keep tests isolated and independent
- Clean up resources after tests
- Use type-safe operations throughout your tests 

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Inconsistent Test Data

**Issue**: Tests are failing intermittently due to data inconsistencies.
```typescript
// ❌ Bad: Unpredictable test data
it('should calculate total bookings', () => {
  const bookings = TestFactory.createManyBookings(3);
  const total = calculateTotal(bookings);
  expect(total).toBe(150); // Might fail if prices vary
});
```

**Solution**: Use specific overrides to ensure consistent data.
```typescript
// ✅ Good: Consistent test data
it('should calculate total bookings', () => {
  const bookings = TestFactory.createManyBookings(3, {
    price: 50 // Fixed price for predictable results
  });
  const total = calculateTotal(bookings);
  expect(total).toBe(150); // Will always pass
});
```

#### 2. Test Data Pollution

**Issue**: Tests affecting each other due to shared state.
```typescript
// ❌ Bad: Shared state between tests
describe('UserTests', () => {
  const user = TestFactory.createUser();
  
  it('test1', () => {
    modifyUser(user);
  });
  
  it('test2', () => {
    // User state is now modified from previous test
    expect(user.name).toBe('Original Name'); // Might fail
  });
});
```

**Solution**: Reset state and create fresh data for each test.
```typescript
// ✅ Good: Isolated test data
describe('UserTests', () => {
  let user;
  
  beforeEach(() => {
    TestFactory.reset();
    user = TestFactory.createUser();
  });
  
  it('test1', () => {
    modifyUser(user);
  });
  
  it('test2', () => {
    expect(user.name).toBe('Original Name'); // Will pass
  });
});
```

#### 3. Circular Dependencies

**Issue**: Related entities creating circular references.
```typescript
// ❌ Bad: Circular dependency
const provider = TestFactory.createUser({ role: 'provider' });
const service = TestFactory.createService({ providerId: provider.id });
provider.services = [service]; // Creates circular reference
```

**Solution**: Use factory methods designed for relationships.
```typescript
// ✅ Good: Using relationship factory method
const { provider, services } = TestFactory.createProviderWithServices(1);
// Relationships are properly set up
```

#### 4. Date/Time Issues

**Issue**: Tests failing due to time-sensitive data.
```typescript
// ❌ Bad: Time-dependent test
it('should check booking validity', () => {
  const booking = TestFactory.createBooking({
    date: new Date().toISOString()
  });
  expect(isBookingValid(booking)).toBe(true);
});
```

**Solution**: Use fixed dates and mock time-sensitive operations.
```typescript
// ✅ Good: Fixed time for consistent testing
it('should check booking validity', () => {
  const fixedDate = '2024-03-15T10:00:00Z';
  jest.useFakeTimers().setSystemTime(new Date(fixedDate));
  
  const booking = TestFactory.createBooking({
    date: fixedDate
  });
  expect(isBookingValid(booking)).toBe(true);
});
```

#### 5. Database Conflicts

**Issue**: Tests failing due to database constraints.
```typescript
// ❌ Bad: Potential database conflicts
it('should create user', async () => {
  const user = TestFactory.createUser({ email: 'test@example.com' });
  await db.users.create(user);
  // Might fail if email already exists
});
```

**Solution**: Use unique identifiers and proper cleanup.
```typescript
// ✅ Good: Ensuring unique data
it('should create user', async () => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const user = TestFactory.createUser({ email: uniqueEmail });
  
  try {
    await db.users.create(user);
  } finally {
    await db.users.delete({ where: { email: uniqueEmail } });
  }
});
```

#### 6. Async Operation Timing

**Issue**: Tests failing due to race conditions.
```typescript
// ❌ Bad: Race condition in async test
it('should update service status', async () => {
  const service = TestFactory.createService();
  updateServiceStatus(service);
  expect(service.status).toBe('updated'); // Might fail
});
```

**Solution**: Properly await async operations.
```typescript
// ✅ Good: Handling async operations
it('should update service status', async () => {
  const service = TestFactory.createService();
  await updateServiceStatus(service);
  
  // Wait for any pending state updates
  await waitFor(() => {
    expect(service.status).toBe('updated');
  });
});
```

### Best Practices for Troubleshooting

1. **Isolation**
   ```typescript
   // Ensure test isolation
   beforeEach(() => {
     TestFactory.reset();
     jest.clearAllMocks();
     localStorage.clear();
   });
   ```

2. **Debugging**
   ```typescript
   // Add debug logging in tests
   const debugTest = (data: any) => {
     if (process.env.DEBUG) {
       console.log(JSON.stringify(data, null, 2));
     }
   };
   
   it('complex test', () => {
     const testData = TestFactory.createProviderWithServices(2);
     debugTest(testData);
     // Rest of test...
   });
   ```

3. **Error Handling**
   ```typescript
   // Proper error handling in tests
   it('should handle errors', async () => {
     try {
       const data = await complexOperation();
       expect(data).toBeDefined();
     } catch (error) {
       // Log detailed error information
       console.error('Test failed with error:', {
         message: error.message,
         stack: error.stack,
         testData: error.testData
       });
       throw error;
     }
   });
   ```

### Common Gotchas to Watch For

1. **Memory Usage**
   - Don't create large amounts of test data unnecessarily
   - Clean up resources after tests
   - Use `TestFactory.reset()` regularly

2. **Test Independence**
   - Each test should be able to run in isolation
   - Don't rely on test execution order
   - Don't share mutable state between tests

3. **Deterministic Tests**
   - Use fixed values for timestamps
   - Set specific seeds for random data
   - Avoid relying on external services

4. **Performance**
   - Create only the data you need
   - Use bulk operations when possible
   - Clean up data in batches

Remember:
- Always reset the factory between tests
- Use meaningful test data
- Handle async operations properly
- Clean up resources after tests
- Keep tests focused and independent 

## Additional Troubleshooting Scenarios

### 1. Component Re-rendering Issues

**Issue**: Tests failing due to unexpected component re-renders.
```typescript
// ❌ Bad: Test affected by re-renders
it('should update service price', () => {
  const service = TestFactory.createService();
  render(<PriceDisplay service={service} />);
  
  act(() => {
    service.price = 100;
  });
  
  expect(screen.getByText('$100')).toBeInTheDocument(); // Might fail
});
```

**Solution**: Use proper state management and React Testing Library practices.
```typescript
// ✅ Good: Proper handling of state updates
it('should update service price', () => {
  const { rerender } = render(
    <PriceDisplay service={TestFactory.createService({ price: 50 })} />
  );
  
  const updatedService = TestFactory.createService({ price: 100 });
  rerender(<PriceDisplay service={updatedService} />);
  
  expect(screen.getByText('$100')).toBeInTheDocument();
});
```

### 2. Mock Function Issues

**Issue**: Mock functions not being called as expected.
```typescript
// ❌ Bad: Incorrect mock setup
it('should handle booking confirmation', () => {
  const onConfirm = jest.fn();
  const booking = TestFactory.createBooking();
  
  render(<BookingConfirmation booking={booking} onConfirm={onConfirm} />);
  fireEvent.click(screen.getByText('Confirm'));
  
  expect(onConfirm).toHaveBeenCalled(); // Might fail due to async operation
});
```

**Solution**: Properly handle async operations and mock timing.
```typescript
// ✅ Good: Proper async mock handling
it('should handle booking confirmation', async () => {
  const onConfirm = jest.fn();
  const booking = TestFactory.createBooking();
  
  render(<BookingConfirmation booking={booking} onConfirm={onConfirm} />);
  await userEvent.click(screen.getByText('Confirm'));
  
  await waitFor(() => {
    expect(onConfirm).toHaveBeenCalledWith(booking.id);
  });
});
```

### 3. Complex Form Submissions

**Issue**: Form submission tests failing intermittently.
```typescript
// ❌ Bad: Unreliable form submission test
it('should submit booking form', () => {
  const { provider, services } = TestFactory.createProviderWithServices(1);
  
  render(<BookingForm provider={provider} services={services} />);
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2024-03-15' } });
  fireEvent.click(screen.getByText('Submit'));
  
  expect(screen.getByText('Booking Confirmed')).toBeInTheDocument(); // Unreliable
});
```

**Solution**: Handle all form interactions and async operations properly.
```typescript
// ✅ Good: Reliable form submission test
it('should submit booking form', async () => {
  const { provider, services } = TestFactory.createProviderWithServices(1);
  const mockSubmit = jest.fn();
  
  render(<BookingForm provider={provider} services={services} onSubmit={mockSubmit} />);
  
  // Fill all required fields
  await userEvent.type(screen.getByLabelText('Date'), '2024-03-15');
  await userEvent.selectOptions(screen.getByLabelText('Service'), services[0].id.toString());
  await userEvent.type(screen.getByLabelText('Notes'), 'Test booking');
  
  // Submit form
  await userEvent.click(screen.getByText('Submit'));
  
  // Wait for submission and verification
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      serviceId: services[0].id,
      date: '2024-03-15',
      notes: 'Test booking'
    }));
  });
  
  expect(await screen.findByText('Booking Confirmed')).toBeInTheDocument();
});
```

## Debugging Tools and Techniques

### 1. Enhanced Console Logging

```typescript
// Create a debug utility
const TestDebugger = {
  enabled: process.env.DEBUG === 'true',
  
  log(context: string, data: any) {
    if (this.enabled) {
      console.log(`[${context}]`, JSON.stringify(data, null, 2));
    }
  },
  
  error(context: string, error: Error) {
    if (this.enabled) {
      console.error(`[${context}] Error:`, {
        message: error.message,
        stack: error.stack,
        context: error.context
      });
    }
  },
  
  trace(context: string) {
    if (this.enabled) {
      console.trace(`[${context}] Execution trace:`);
    }
  }
};

// Usage in tests
it('complex test scenario', async () => {
  TestDebugger.log('Setup', 'Initializing test data');
  const testData = TestFactory.createProviderWithServices(2);
  TestDebugger.log('TestData', testData);
  
  try {
    // Test logic
  } catch (error) {
    TestDebugger.error('TestExecution', error);
    throw error;
  }
});
```

### 2. Component Testing Tools

```typescript
// Helper for debugging component renders
const debugComponent = (component: React.ReactElement) => {
  const { container } = render(component);
  
  return {
    logHTML: () => console.log(container.innerHTML),
    logProps: () => console.log(component.props),
    logState: () => console.log('Component State:', (component as any).state),
    logEvents: () => {
      const events = Object.keys(component.props)
        .filter(key => key.startsWith('on'));
      console.log('Available Events:', events);
    }
  };
};

// Usage
it('component investigation', () => {
  const service = TestFactory.createService();
  const debug = debugComponent(<ServiceCard service={service} />);
  
  debug.logProps();
  debug.logHTML();
});
```

### 3. Network Request Debugging

```typescript
// Network request debugger
const NetworkDebugger = {
  setupDebugInterceptor(mockApi: any) {
    mockApi.onAny().reply((config: any) => {
      TestDebugger.log('API Request', {
        method: config.method,
        url: config.url,
        data: config.data ? JSON.parse(config.data) : undefined,
        headers: config.headers
      });
      
      // Continue with normal mock handling
      return [200, { success: true }];
    });
  }
};

// Usage
beforeEach(() => {
  NetworkDebugger.setupDebugInterceptor(mockApi);
});
```

## Performance Optimization

### 1. Efficient Data Creation

```typescript
// ❌ Bad: Creating unnecessary data
beforeEach(() => {
  // Creating too much data
  const users = TestFactory.createManyUsers(100);
  const services = TestFactory.createManyServices(50);
});

// ✅ Good: Optimized data creation
beforeEach(() => {
  // Create only what's needed
  const testData = {
    users: TestFactory.createManyUsers(2),
    services: TestFactory.createManyServices(1)
  };
});
```

### 2. Batch Operations

```typescript
// Helper for batch operations
const BatchOperations = {
  async createManyEntities<T>(
    factory: (...args: any[]) => T,
    count: number,
    batchSize = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < count; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, count - i) })
        .map(() => factory());
      results.push(...batch);
      
      // Allow other operations between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  }
};

// Usage
it('performance test', async () => {
  const users = await BatchOperations.createManyEntities(
    () => TestFactory.createUser(),
    100,
    10
  );
});
```

### 3. Caching Test Data

```typescript
// Test data cache
const TestDataCache = {
  private cache: Map<string, any> = new Map(),
  
  async getOrCreate(key: string, creator: () => Promise<any>) {
    if (!this.cache.has(key)) {
      this.cache.set(key, await creator());
    }
    return this.cache.get(key);
  },
  
  clear() {
    this.cache.clear();
  }
};

// Usage
describe('Performance-sensitive tests', () => {
  beforeAll(async () => {
    // Create and cache complex test data
    await TestDataCache.getOrCreate('provider-setup', async () => {
      const { provider, services } = TestFactory.createProviderWithServices(5);
      const bookings = TestFactory.createManyBookings(10, {
        serviceId: services[0].id
      });
      return { provider, services, bookings };
    });
  });
  
  afterAll(() => {
    TestDataCache.clear();
  });
  
  it('should use cached data', async () => {
    const testData = await TestDataCache.getOrCreate('provider-setup');
    // Use cached data in test
  });
});
```

### 4. Memory Management

```typescript
// Memory usage tracker
const MemoryTracker = {
  private snapshots: Map<string, number> = new Map(),
  
  takeSnapshot(label: string) {
    const usage = process.memoryUsage();
    this.snapshots.set(label, usage.heapUsed);
    TestDebugger.log('Memory Snapshot', {
      label,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
    });
  },
  
  compareSnapshots(label1: string, label2: string) {
    const snapshot1 = this.snapshots.get(label1);
    const snapshot2 = this.snapshots.get(label2);
    const diff = (snapshot2! - snapshot1!) / 1024 / 1024;
    
    TestDebugger.log('Memory Comparison', {
      diff: `${Math.round(diff)} MB`,
      increased: diff > 0
    });
  }
};

// Usage
describe('Memory-intensive tests', () => {
  beforeEach(() => {
    MemoryTracker.takeSnapshot('start');
  });
  
  afterEach(() => {
    MemoryTracker.takeSnapshot('end');
    MemoryTracker.compareSnapshots('start', 'end');
  });
});
```

Remember:
- Use debugging tools judiciously to avoid performance impact
- Clean up test data and reset state between tests
- Monitor memory usage in large test suites
- Use batch operations for large datasets
- Cache complex test data when appropriate
- Profile test performance regularly

Remember:
- Use meaningful test data
- Handle async operations properly
- Clean up resources after tests
- Keep tests focused and independent 

## CI/CD Pipeline Integration

### 1. GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      DEBUG: false
      TEST_TIMEOUT: 30000
      MAX_WORKERS: 2
      
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Cache Test Data
        uses: actions/cache@v2
        with:
          path: |
            tests/.cache
            node_modules
          key: ${{ runner.os }}-test-${{ hashFiles('**/package-lock.json') }}
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Tests
        run: npm test -- --maxWorkers=$MAX_WORKERS
        env:
          CI: true
          
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: coverage/
```

### 2. Test Suite Configuration for CI

```typescript
// jest.config.ci.js
module.exports = {
  ...require('./jest.config'),
  maxWorkers: process.env.MAX_WORKERS || '50%',
  testTimeout: parseInt(process.env.TEST_TIMEOUT) || 10000,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{filepath}',
      titleTemplate: '{title}'
    }]
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/ci-setup.ts',
    ...require('./jest.config').setupFilesAfterEnv
  ]
};
```

### 3. CI-Specific Test Setup

```typescript
// tests/ci-setup.ts
import { TestFactory } from './factories/test-factory';
import { TestDataCache } from './utils/test-cache';

// Configure longer timeouts for CI environment
jest.setTimeout(process.env.TEST_TIMEOUT || 10000);

// Setup global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Configure test factory for CI
TestFactory.configure({
  maxParallelOperations: parseInt(process.env.MAX_WORKERS) || 2,
  enableLogging: process.env.DEBUG === 'true',
  cachePath: process.env.CI ? '/tmp/test-cache' : undefined
});

// Clear test cache before all tests
beforeAll(async () => {
  if (process.env.CI) {
    await TestDataCache.clear();
  }
});

// Additional CI-specific setup
if (process.env.CI) {
  // Disable animations
  jest.mock('react-transition-group', () => ({
    CSSTransition: (props: any) => props.children
  }));
  
  // Mock timers
  jest.useFakeTimers();
}
```

### 4. Performance Optimization for CI

```typescript
// tests/utils/ci-optimizations.ts
export const CIOptimizations = {
  // Batch size calculator based on available resources
  calculateBatchSize() {
    if (process.env.CI) {
      const workers = parseInt(process.env.MAX_WORKERS) || 2;
      return Math.max(5, Math.floor(100 / workers));
    }
    return 20; // Default for local development
  },

  // Parallel test data creation
  async createTestData(creator: () => Promise<any>, count: number) {
    const batchSize = this.calculateBatchSize();
    const results = [];
    
    for (let i = 0; i < count; i += batchSize) {
      const batch = await Promise.all(
        Array(Math.min(batchSize, count - i))
          .fill(null)
          .map(creator)
      );
      results.push(...batch);
    }
    
    return results;
  }
};

// Usage in tests
describe('CI-optimized tests', () => {
  it('should handle large datasets efficiently', async () => {
    const services = await CIOptimizations.createTestData(
      () => TestFactory.createService(),
      50
    );
    expect(services).toHaveLength(50);
  });
});
```

## Additional Edge Cases and Solutions

### 1. Race Conditions in Parallel Tests

**Issue**: Tests interfering with each other when running in parallel.
```typescript
// ❌ Bad: Potential race condition
describe('Parallel tests', () => {
  let sharedCounter = 0;
  
  it('test 1', async () => {
    sharedCounter++;
    await someAsyncOperation();
    expect(sharedCounter).toBe(1); // Might fail
  });
  
  it('test 2', async () => {
    sharedCounter++;
    await someAsyncOperation();
    expect(sharedCounter).toBe(1); // Might fail
  });
});
```

**Solution**: Use isolated state and proper test isolation.
```typescript
// ✅ Good: Proper test isolation
describe('Parallel tests', () => {
  let testContext: { counter: number };
  
  beforeEach(() => {
    testContext = { counter: 0 };
  });
  
  it('test 1', async () => {
    testContext.counter++;
    await someAsyncOperation();
    expect(testContext.counter).toBe(1);
  });
  
  it('test 2', async () => {
    testContext.counter++;
    await someAsyncOperation();
    expect(testContext.counter).toBe(1);
  });
});
```

### 2. Time-sensitive Tests

**Issue**: Tests failing due to timezone or time-dependent operations.
```typescript
// ❌ Bad: Time-dependent test
it('should calculate booking duration', () => {
  const booking = TestFactory.createBooking({
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString()
  });
  
  expect(calculateDuration(booking)).toBe(60); // Might fail across timezones
});
```

**Solution**: Use fixed timestamps and mock date/time operations.
```typescript
// ✅ Good: Time-zone safe tests
describe('Time-sensitive tests', () => {
  const MockDate = {
    current: new Date('2024-03-15T12:00:00Z'),
    
    setup() {
      jest.useFakeTimers();
      jest.setSystemTime(this.current);
    },
    
    teardown() {
      jest.useRealTimers();
    }
  };
  
  beforeEach(() => {
    MockDate.setup();
  });
  
  afterEach(() => {
    MockDate.teardown();
  });
  
  it('should calculate booking duration', () => {
    const booking = TestFactory.createBooking({
      startTime: '2024-03-15T12:00:00Z',
      endTime: '2024-03-15T13:00:00Z'
    });
    
    expect(calculateDuration(booking)).toBe(60);
  });
});
```

### 3. Database Transaction Handling

**Issue**: Tests failing due to transaction rollback issues.
```typescript
// ❌ Bad: Unreliable transaction handling
it('should handle booking creation', async () => {
  const booking = TestFactory.createBooking();
  await db.bookings.create(booking);
  
  // Test might fail if transaction isn't properly rolled back
  await expect(db.bookings.count()).resolves.toBe(1);
});
```

**Solution**: Proper transaction isolation and cleanup.
```typescript
// ✅ Good: Reliable transaction handling
describe('Database operations', () => {
  const DbTransaction = {
    async withTransaction(fn: (trx: any) => Promise<void>) {
      const trx = await db.transaction();
      try {
        await fn(trx);
        await trx.rollback(); // Always rollback in tests
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }
  };
  
  it('should handle booking creation', async () => {
    await DbTransaction.withTransaction(async (trx) => {
      const booking = TestFactory.createBooking();
      await db.bookings.create(booking, { transaction: trx });
      
      const count = await db.bookings.count({ transaction: trx });
      expect(count).toBe(1);
    });
  });
});
```

### 4. Memory Leaks in Long-running Tests

**Issue**: Memory leaks in tests with many iterations.
```typescript
// ❌ Bad: Potential memory leak
it('should handle many operations', async () => {
  const results = [];
  for (let i = 0; i < 1000; i++) {
    const data = await complexOperation();
    results.push(data); // Memory keeps growing
  }
});
```

**Solution**: Use streams and proper cleanup.
```typescript
// ✅ Good: Memory-efficient operations
describe('Memory-intensive tests', () => {
  const StreamProcessor = {
    async processLarge(count: number, operation: () => Promise<any>) {
      const results = [];
      const batchSize = 50;
      
      for (let i = 0; i < count; i += batchSize) {
        const batch = await Promise.all(
          Array(Math.min(batchSize, count - i))
            .fill(null)
            .map(operation)
        );
        
        // Process batch and release memory
        results.push(...batch.map(r => r.id));
        batch.length = 0; // Clear batch
        
        // Allow garbage collection
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      return results;
    }
  };
  
  it('should handle many operations efficiently', async () => {
    const results = await StreamProcessor.processLarge(
      1000,
      () => TestFactory.createBooking()
    );
    expect(results).toHaveLength(1000);
  });
});
```

### 5. Network Flakiness

**Issue**: Tests failing due to network instability.
```typescript
// ❌ Bad: Brittle network tests
it('should fetch data', async () => {
  const response = await fetch('/api/data');
  expect(response.ok).toBe(true);
});
```

**Solution**: Implement retry logic and timeout handling.
```typescript
// ✅ Good: Resilient network testing
describe('Network operations', () => {
  const NetworkHelper = {
    async withRetry<T>(
      operation: () => Promise<T>,
      maxRetries = 3,
      delay = 1000
    ): Promise<T> {
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw new Error(`Operation failed after ${maxRetries} retries: ${lastError}`);
    }
  };
  
  it('should handle network instability', async () => {
    const result = await NetworkHelper.withRetry(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Request failed');
      return response.json();
    });
    
    expect(result).toBeDefined();
  });
});
```

Remember:
- Always configure timeouts appropriately for CI environments
- Use proper cleanup mechanisms
- Implement retry logic for flaky operations
- Monitor memory usage in CI pipelines
- Use appropriate batch sizes based on available resources
- Cache test data when possible to improve CI performance

## Additional CI/CD Platform Configurations

### GitLab CI Configuration

```yaml
# .gitlab-ci.yml
image: node:18

variables:
  TEST_TIMEOUT: 30000
  MAX_WORKERS: 2

cache:
  paths:
    - node_modules/
    - tests/.cache/

stages:
  - test
  - report

test:
  stage: test
  script:
    - npm ci
    - npm test -- --maxWorkers=$MAX_WORKERS --ci
  artifacts:
    reports:
      junit: test-results/junit.xml
    paths:
      - coverage/
      - test-results/

coverage:
  stage: report
  script:
    - npm run coverage:report
  coverage: '/Lines\s*:\s*([0-9.]+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

### CircleCI Configuration

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.0.0

jobs:
  test:
    docker:
      - image: cimg/node:18.0.0
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Run Tests
          command: |
            mkdir -p test-results/jest
            npm test -- --maxWorkers=2 \
              --reporters=default \
              --reporters=jest-junit
          environment:
            JEST_JUNIT_OUTPUT_DIR: test-results/jest
            TEST_TIMEOUT: 30000
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage
          destination: coverage

workflows:
  version: 2
  test:
    jobs:
      - test
```

## Cloud Provider Integrations

### AWS CodeBuild Configuration

```yaml
# buildspec.yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  
  pre_build:
    commands:
      - aws s3 cp s3://${BUCKET_NAME}/test-cache.tar.gz ./test-cache.tar.gz || true
      - if [ -f test-cache.tar.gz ]; then tar -xzf test-cache.tar.gz; fi
  
  build:
    commands:
      - npm test -- --maxWorkers=2
  
  post_build:
    commands:
      - tar -czf test-cache.tar.gz tests/.cache
      - aws s3 cp test-cache.tar.gz s3://${BUCKET_NAME}/test-cache.tar.gz
      - aws cloudwatch put-metric-data --namespace "TestMetrics" --metric-name "TestDuration" --value $CODEBUILD_BUILD_DURATION

reports:
  jest_reports:
    files:
      - test-results/junit.xml
    file-format: JUNITXML
```

### Azure Pipelines Configuration

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  TEST_TIMEOUT: 30000
  MAX_WORKERS: 2

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    restoreKeys: |
      npm | "$(Agent.OS)"
    path: |
      $(npm_config_cache)
      tests/.cache
  displayName: Cache npm packages and test data

- script: npm ci
  displayName: 'Install dependencies'

- script: |
    npm test -- --maxWorkers=$(MAX_WORKERS) --ci
  displayName: 'Run tests'
  env:
    AZURE_CREDENTIALS: $(AZURE_CREDENTIALS)

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/junit.xml'
    mergeTestResults: true

- task: PublishCodeCoverageResults@1
  inputs:
    codeCoverageTool: Cobertura
    summaryFileLocation: '$(System.DefaultWorkingDirectory)/coverage/cobertura-coverage.xml'
```

## Additional Edge Cases

### 1. WebSocket Connection Management

```typescript
// ❌ Bad: Unreliable WebSocket test
it('should handle WebSocket messages', () => {
  const ws = new WebSocket('ws://localhost:8080');
  ws.send('test message');
  expect(receivedMessage).toBe('response'); // Unreliable
});

// ✅ Good: Proper WebSocket testing
describe('WebSocket Tests', () => {
  const WebSocketTester = {
    async createConnection(url: string, options = {}) {
      const ws = new WebSocket(url);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          resolve(ws);
        };
        
        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };
      });
    },
    
    async waitForMessage(ws: WebSocket, matcher: (data: any) => boolean) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, 5000);
        
        ws.onmessage = (event) => {
          if (matcher(event.data)) {
            clearTimeout(timeout);
            resolve(event.data);
          }
        };
      });
    }
  };
  
  it('should handle WebSocket messages', async () => {
    const ws = await WebSocketTester.createConnection('ws://localhost:8080');
    ws.send('test message');
    
    const response = await WebSocketTester.waitForMessage(
      ws,
      data => data.type === 'response'
    );
    expect(response).toBeDefined();
  });
});
```

### 2. File System Operations

```typescript
// ❌ Bad: Unreliable file system test
it('should process uploaded files', async () => {
  const file = new File(['content'], 'test.txt');
  await uploadFile(file);
  expect(fs.existsSync('/uploads/test.txt')).toBe(true);
});

// ✅ Good: Reliable file system testing
describe('File System Tests', () => {
  const FileSystemTester = {
    private testDir: string;
    
    async setup() {
      this.testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
    },
    
    async cleanup() {
      await fs.rm(this.testDir, { recursive: true, force: true });
    },
    
    async createTestFile(content: string, filename: string) {
      const filePath = path.join(this.testDir, filename);
      await fs.writeFile(filePath, content);
      return filePath;
    },
    
    async waitForFile(filename: string, timeout = 5000) {
      const filePath = path.join(this.testDir, filename);
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        if (await fs.exists(filePath)) return true;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return false;
    }
  };
  
  beforeEach(async () => {
    await FileSystemTester.setup();
  });
  
  afterEach(async () => {
    await FileSystemTester.cleanup();
  });
  
  it('should process uploaded files', async () => {
    const filePath = await FileSystemTester.createTestFile('content', 'test.txt');
    await uploadFile(filePath);
    
    expect(await FileSystemTester.waitForFile('processed-test.txt')).toBe(true);
  });
});
```

## Monitoring and Reporting

### 1. Test Metrics Collection

```typescript
// tests/utils/metrics.ts
export const TestMetrics = {
  private metrics: Map<string, number[]> = new Map(),
  
  recordDuration(testName: string, duration: number) {
    if (!this.metrics.has(testName)) {
      this.metrics.set(testName, []);
    }
    this.metrics.get(testName)!.push(duration);
  },
  
  getStatistics() {
    const stats = {};
    for (const [test, durations] of this.metrics.entries()) {
      stats[test] = {
        avg: durations.reduce((a, b) => a + b) / durations.length,
        max: Math.max(...durations),
        min: Math.min(...durations),
        count: durations.length
      };
    }
    return stats;
  },
  
  async reportToCloudWatch(namespace: string) {
    const stats = this.getStatistics();
    const cloudwatch = new AWS.CloudWatch();
    
    for (const [test, metrics] of Object.entries(stats)) {
      await cloudwatch.putMetricData({
        Namespace: namespace,
        MetricData: [
          {
            MetricName: `TestDuration_${test}`,
            Value: metrics.avg,
            Unit: 'Milliseconds',
            Dimensions: [
              {
                Name: 'TestName',
                Value: test
              }
            ]
          }
        ]
      }).promise();
    }
  }
};

// Usage in tests
describe('Monitored tests', () => {
  let startTime: number;
  
  beforeEach(() => {
    startTime = Date.now();
  });
  
  afterEach(() => {
    const duration = Date.now() - startTime;
    TestMetrics.recordDuration(expect.getState().currentTestName!, duration);
  });
  
  afterAll(async () => {
    if (process.env.CI) {
      await TestMetrics.reportToCloudWatch('TestMetrics');
    }
  });
});
```

### 2. Test Report Generation

```typescript
// tests/utils/reporting.ts
export const TestReporter = {
  private results: any[] = [];
  
  recordTestResult(testName: string, result: any) {
    this.results.push({
      name: testName,
      result,
      timestamp: new Date().toISOString()
    });
  },
  
  async generateHTML() {
    const template = await fs.readFile('templates/report.html', 'utf8');
    const html = template.replace(
      '{{DATA}}',
      JSON.stringify(this.results, null, 2)
    );
    await fs.writeFile('test-results/report.html', html);
  },
  
  async generateJUnit() {
    const builder = new XMLBuilder();
    const xml = builder.buildObject({
      testsuites: {
        testsuite: this.results.map(r => ({
          testcase: {
            $: {
              name: r.name,
              time: r.duration / 1000
            },
            failure: r.error ? {
              _: r.error.message,
              $: { type: r.error.type }
            } : undefined
          }
        }))
      }
    });
    await fs.writeFile('test-results/junit.xml', xml);
  }
};

// Integration with test runner
if (process.env.GENERATE_REPORTS) {
  afterAll(async () => {
    await TestReporter.generateHTML();
    await TestReporter.generateJUnit();
  });
}
```

### 3. Performance Monitoring

```typescript
// tests/utils/performance.ts
export const PerformanceMonitor = {
  private marks: Map<string, number> = new Map(),
  private measures: Map<string, number[]> = new Map(),
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  },
  
  measure(name: string, startMark: string, endMark: string) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (start && end) {
      if (!this.measures.has(name)) {
        this.measures.set(name, []);
      }
      this.measures.get(name)!.push(end - start);
    }
  },
  
  getReport() {
    const report = {};
    for (const [name, durations] of this.measures.entries()) {
      report[name] = {
        avg: durations.reduce((a, b) => a + b) / durations.length,
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99),
        count: durations.length
      };
    }
    return report;
  },
  
  private percentile(arr: number[], p: number) {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * p / 100;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }
};

// Usage in tests
describe('Performance-sensitive tests', () => {
  beforeEach(() => {
    PerformanceMonitor.mark('testStart');
  });
  
  afterEach(() => {
    PerformanceMonitor.mark('testEnd');
    PerformanceMonitor.measure(
      expect.getState().currentTestName!,
      'testStart',
      'testEnd'
    );
  });
  
  afterAll(() => {
    console.log('Performance Report:', PerformanceMonitor.getReport());
  });
});
```

Remember:
- Configure appropriate timeouts for each CI/CD platform
- Use platform-specific caching strategies
- Implement proper cleanup for each cloud provider
- Monitor and report test metrics consistently
- Handle platform-specific environment variables
- Use appropriate security configurations for each cloud provider
- Implement proper error handling for each platform's limitations