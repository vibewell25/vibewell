# VibeWell Testing Guide

This guide provides comprehensive instructions for writing high-quality tests for the VibeWell application. Following these guidelines will help us reach our goal of 100% test coverage, especially for critical business flows.

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Testing Patterns](#testing-patterns)
4. [Critical Paths](#critical-paths)
5. [Test-First Development](#test-first-development)
6. [Pair Programming for Tests](#pair-programming-for-tests)
7. [Testing Tools](#testing-tools)
8. [Coverage Requirements](#coverage-requirements)

## Testing Philosophy

Our testing approach is based on the following principles:

1. **Tests are documentation**: Well-written tests serve as documentation for how components, services and APIs should behave.
2. **Tests provide confidence**: Tests allow us to refactor and improve code with confidence that existing functionality still works.
3. **Tests catch regressions**: Tests prevent bugs from reappearing after they've been fixed.
4. **Test critical paths thoroughly**: Focus on testing business-critical flows completely.
5. **Test-first development**: Write tests before implementing features to ensure testability.

## Test Structure

All tests should follow the "Arrange-Act-Assert" (AAA) pattern:

```typescript
it('should do something specific', async () => {
  // Arrange - set up test data and conditions
  const input = { name: 'Test' };
  vi.mock('dependency', () => ({ method: vi.fn().mockResolvedValue('result') }));
  
  // Act - execute the code under test
  const result = await functionUnderTest(input);
  
  // Assert - verify the expected outcome
  expect(result).toEqual('expected output');
  expect(dependency.method).toHaveBeenCalledWith(input);
});
```

## Testing Patterns

We have established patterns for testing different types of code:

### 1. Component Testing Pattern

Use the `createComponentTestSuite` function from `src/test-utils/patterns/component.tsx`:

```typescript
import { createComponentTestSuite } from '@/test-utils/patterns/component';

// Define default props
const defaultProps = { /* default props */ };

// Define test cases
const testCases = [
  {
    name: 'handles user interaction correctly',
    props: { /* specific props */ },
    interactions: [
      { type: 'click', target: 'Button Text' },
    ],
    assertions: async (screen, { userEvent }) => {
      expect(screen.getByText('Expected Result')).toBeInTheDocument();
    },
  },
];

// Create the test suite
createComponentTestSuite('ComponentName', ComponentName, defaultProps, testCases);
```

This automatically tests:
- Rendering with default props
- Accessibility compliance
- Specific test cases with interactions

### 2. Service Testing Pattern

Use the `createServiceTestSuite` function from `src/test-utils/patterns/service.tsx`:

```typescript
import { createServiceTestSuite } from '@/test-utils/patterns/service';

// Define test cases
const testCases = [
  {
    name: 'creates a resource successfully',
    method: 'createResource',
    mockSetup: (mocks) => {
      mocks.prisma.resource.create.mockResolvedValue({ id: 'resource-id' });
    },
    args: [{ name: 'Test Resource' }],
    expected: { id: 'resource-id' },
    assertions: (mocks, result) => {
      expect(mocks.prisma.resource.create).toHaveBeenCalledWith({
        data: { name: 'Test Resource' },
      });
    },
  },
];

// Create the test suite
createServiceTestSuite('ServiceName', ServiceName, testCases);
```

### 3. API Route Testing Pattern

For API routes (Next.js App Router), follow this pattern:

```typescript
import { GET, POST } from '@/app/api/resource/route';
import { NextRequest, NextResponse } from 'next/server';

describe('Resource API', () => {
  // Helper to create mock request
  const createRequest = (method, body = {}, searchParams = {}) => {
    const url = new URL('https://example.com/api/resource');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return new NextRequest(url, {
      method,
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });
  };
  
  // Test GET method
  describe('GET', () => {
    it('returns resources successfully', async () => {
      const request = createRequest('GET');
      const response = await GET(request);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });
});
```

## Critical Paths

Focus on testing these critical business flows to 100% coverage:

### 1. Authentication & Authorization
- User registration
- Login/logout
- Password reset
- JWT token validation
- Access control

### 2. Booking & Appointments
- Checking availability
- Creating bookings
- Modifying appointments
- Cancellation flows
- Notifications

### 3. Payment Processing
- Payment method management
- Transaction processing
- Invoicing
- Refunds
- Subscription management

## Test-First Development

1. **Start with a test**: Before implementing a feature, write tests that define the expected behavior.
2. **Run the test**: Verify that the test fails (since the implementation doesn't exist yet).
3. **Implement the feature**: Write just enough code to make the test pass.
4. **Refactor**: Improve the code while keeping the tests passing.
5. **Repeat**: Add more tests for edge cases or additional functionality.

This approach ensures:
- Your code is testable by design
- You only write code that's needed
- You have clear expectations before implementation
- You achieve high test coverage naturally

## Pair Programming for Tests

For critical paths, we recommend pair programming for test creation:

### Roles in Test Pair Programming:

1. **Navigator**: Focuses on the testing strategy, edge cases, and overall test design.
2. **Driver**: Focuses on implementing the tests and making them pass.

### Pair Testing Process:
1. **Planning Session** (15 minutes):
   - Define test cases and scenarios
   - Identify edge cases and error conditions
   - Decide on testing strategy

2. **Test Implementation** (45-60 minutes):
   - Driver writes tests based on the plan
   - Navigator reviews tests for thoroughness
   - Switch roles periodically

3. **Review and Refine** (15 minutes):
   - Review coverage metrics
   - Identify any missing scenarios
   - Plan next steps

### Benefits:
- Knowledge sharing
- Higher quality tests
- Better coverage of edge cases
- Shared understanding of critical code paths

## Testing Tools

We use the following tools for testing:

1. **Vitest**: Test runner and assertion library
2. **React Testing Library**: Component testing
3. **Jest-Axe**: Accessibility testing
4. **MSW**: API mocking
5. **Playwright**: End-to-end testing

### Using the Test Generator

We've created an automated test generator to simplify test creation:

```bash
node scripts/generate-tests.js
```

This will:
- Scan for untested files
- Generate test skeletons based on patterns
- Add placeholder tests for methods/functions

Customize the generated tests with actual expected behavior.

## Coverage Requirements

Our coverage requirements are enforced in CI/CD:

1. **Overall coverage**: Minimum 20% (gradually increasing)
2. **Critical paths**:
   - Authentication: Minimum 75%
   - Booking: Minimum 75%
   - Payment: Minimum 75%

3. **PR requirements**:
   - New code must have tests
   - Overall coverage must not decrease
   - Critical path coverage must not decrease

### Running Coverage Reports

Run tests with coverage:
```bash
npm run test:coverage
```

Generate a detailed coverage report:
```bash
npm run test:coverage:report
```

View report at `coverage/index.html` 