# Critical Path Testing Plan

This document outlines our plan to achieve 100% test coverage for the most business-critical flows in the Vibewell application.

## Priority Areas

We've identified the following critical areas that require comprehensive testing:

1. **Authentication & Authorization** (Target: 100% coverage)
   - User registration
   - Login/logout flows
   - Password reset
   - JWT/session management
   - Role-based access control
   - Two-factor authentication

2. **Booking & Appointments** (Target: 100% coverage)
   - Appointment scheduling
   - Availability checking
   - Booking confirmation
   - Appointment modification
   - Cancellation flows
   - Reminders and notifications

3. **Payment Processing** (Target: 100% coverage)
   - Payment method management
   - Transaction processing
   - Invoicing
   - Refunds
   - Subscription management
   - Receipts and confirmations

## Testing Approach

We'll use a multi-layered testing approach to ensure comprehensive coverage:

### 1. Unit Tests

- **Services**: Test all methods in authentication, booking, and payment services
- **Utilities**: Test all utility functions used in critical flows
- **Validation**: Test form validation logic
- **State Management**: Test state management functions

### 2. Integration Tests

- **API Endpoints**: Test all critical API routes
- **Service Interactions**: Test interactions between services
- **Database Operations**: Test data persistence and retrieval

### 3. End-to-End Tests

- **Critical User Journeys**: Test complete user flows
- **Edge Cases**: Test error handling and recovery
- **Performance**: Test response times for critical operations

## Implementation Plan

### Phase 1: Authentication & Authorization (Weeks 1-2)

#### Week 1: Unit Tests
- [ ] Create tests for `auth-service.ts`
- [ ] Create tests for auth utilities (`auth-helpers.ts`, `auth-guards.tsx`)
- [ ] Test password hashing and verification
- [ ] Test token generation and validation
- [ ] Test user registration and login validation

#### Week 2: Integration & E2E Tests
- [ ] Test all auth API endpoints
- [ ] Create E2E tests for registration flow
- [ ] Create E2E tests for login flow
- [ ] Create E2E tests for password reset flow
- [ ] Test role-based access to protected resources

### Phase 2: Booking & Appointments (Weeks 3-4)

#### Week 3: Unit Tests
- [ ] Create tests for `booking-service.ts`
- [ ] Create tests for `calendar-service.ts`
- [ ] Create tests for availability checking logic
- [ ] Test notification triggers for bookings
- [ ] Test booking validation rules

#### Week 4: Integration & E2E Tests
- [ ] Test all booking API endpoints
- [ ] Create E2E tests for booking creation
- [ ] Create E2E tests for appointment modification
- [ ] Create E2E tests for cancellation flows
- [ ] Test conflict detection and resolution

### Phase 3: Payment Processing (Weeks 5-6)

#### Week 5: Unit Tests
- [ ] Create tests for `payment-service.ts`
- [ ] Test payment validation logic
- [ ] Test subscription management functions
- [ ] Test receipt generation
- [ ] Test payment error handling

#### Week 6: Integration & E2E Tests
- [ ] Test all payment API endpoints
- [ ] Create E2E tests for payment flows
- [ ] Create E2E tests for subscription management
- [ ] Test refund processes
- [ ] Test invoice generation and delivery

### Phase 4: Test Infrastructure & Automation (Weeks 7-8)

#### Week 7: Coverage Monitoring
- [ ] Configure code coverage reports
- [ ] Set up coverage thresholds in CI/CD
- [ ] Create monitoring dashboards for test coverage
- [ ] Configure PR checks for coverage

#### Week 8: Test Generation & Documentation
- [ ] Configure automated test generation for new components
- [ ] Document testing patterns and best practices
- [ ] Create test templates for future development
- [ ] Train team on testing practices

## Test Implementation Details

### Authentication Tests

```typescript
// Example authentication service test
describe('AuthService', () => {
  describe('login', () => {
    it('should return a valid token when credentials are correct', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
      });
      
      // Act
      const result = await authService.login('user@example.com', 'password123');
      
      // Assert
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-id');
    });
    
    it('should throw error when credentials are incorrect', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
      });
      
      // Act & Assert
      await expect(authService.login('user@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Booking Tests

```typescript
// Example booking service test
describe('BookingService', () => {
  describe('createBooking', () => {
    it('should create a booking when slot is available', async () => {
      // Arrange
      prisma.availabilitySlot.findFirst.mockResolvedValue({
        id: 'slot-id',
        providerId: 'provider-id',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
        isBooked: false,
      });
      
      prisma.booking.create.mockResolvedValue({
        id: 'booking-id',
        userId: 'user-id',
        providerId: 'provider-id',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
        status: 'confirmed',
      });
      
      // Act
      const result = await bookingService.createBooking({
        userId: 'user-id',
        providerId: 'provider-id',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
      });
      
      // Assert
      expect(result.id).toBe('booking-id');
      expect(result.status).toBe('confirmed');
      expect(prisma.availabilitySlot.update).toHaveBeenCalledWith({
        where: { id: 'slot-id' },
        data: { isBooked: true },
      });
    });
    
    it('should throw error when slot is not available', async () => {
      // Arrange
      prisma.availabilitySlot.findFirst.mockResolvedValue(null);
      
      // Act & Assert
      await expect(bookingService.createBooking({
        userId: 'user-id',
        providerId: 'provider-id',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:00:00Z'),
      })).rejects.toThrow('No available slot found');
    });
  });
});
```

### Payment Tests

```typescript
// Example payment service test
describe('PaymentService', () => {
  describe('processPayment', () => {
    it('should process payment successfully with valid payment method', async () => {
      // Arrange
      stripeClient.paymentIntents.create.mockResolvedValue({
        id: 'payment-intent-id',
        status: 'succeeded',
        client_secret: 'client-secret',
      });
      
      prisma.payment.create.mockResolvedValue({
        id: 'payment-id',
        userId: 'user-id',
        amount: 1000,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: 'payment-intent-id',
      });
      
      // Act
      const result = await paymentService.processPayment({
        userId: 'user-id',
        amount: 1000,
        currency: 'usd',
        paymentMethodId: 'payment-method-id',
      });
      
      // Assert
      expect(result.id).toBe('payment-id');
      expect(result.status).toBe('completed');
      expect(stripeClient.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        payment_method: 'payment-method-id',
        confirm: true,
      });
    });
    
    it('should handle payment failure', async () => {
      // Arrange
      stripeClient.paymentIntents.create.mockRejectedValue(
        new Error('Insufficient funds')
      );
      
      // Act & Assert
      await expect(paymentService.processPayment({
        userId: 'user-id',
        amount: 1000,
        currency: 'usd',
        paymentMethodId: 'payment-method-id',
      })).rejects.toThrow('Payment processing failed');
    });
  });
});
```

## Coverage Goals

We will track coverage metrics for each critical path:

| Path                   | Current | Week 2 | Week 4 | Week 6 | Week 8 |
|------------------------|---------|--------|--------|--------|--------|
| Authentication         | 30%     | 60%    | 80%    | 90%    | 100%   |
| Booking & Appointments | 20%     | 40%    | 70%    | 85%    | 100%   |
| Payment Processing     | 15%     | 30%    | 50%    | 75%    | 100%   |
| Overall                | 20%     | 35%    | 55%    | 75%    | 100%   |

## Success Criteria

- **100% test coverage** for all business-critical flows
- All tests passing in CI/CD pipeline
- Automated testing integrated into development workflow
- Comprehensive documentation of testing patterns
- Team trained on test development and maintenance

## Monitoring and Reporting

We will continuously monitor our progress using:

1. **Weekly coverage reports** with detailed metrics per critical path
2. **PR checks** that enforce coverage requirements
3. **Test quality metrics** (execution time, reliability)
4. **Dashboard** showing overall progress toward 100% coverage

## Developer Guidelines

All team members should follow these guidelines:

1. **Test-First Development**: Write tests before implementing features
2. **Coverage Requirements**: All PRs must maintain or increase coverage
3. **Critical Path Focus**: Prioritize tests for authentication, booking, and payment flows
4. **Use Test Patterns**: Leverage established test patterns from `src/test-utils/patterns/`
5. **Pair Testing**: Conduct pair programming sessions focused on test development 