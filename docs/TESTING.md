# Vibewell Testing Guide

## Table of Contents
1. [Testing Overview](#testing-overview)
2. [Test Types](#test-types)
3. [Testing Tools](#testing-tools)
4. [Writing Tests](#writing-tests)
5. [AR Testing](#ar-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [CI/CD Integration](#cicd-integration)

## Testing Overview

### Testing Philosophy
- Test-Driven Development (TDD) approach
- Focus on critical user paths
- Comprehensive coverage of AR features
- Regular performance monitoring
- Continuous security testing

### Test Environment Setup
```bash
# Install all testing dependencies
npm run test:setup

# Configure test environment
cp .env.test.example .env.test

# Verify setup
npm run test:verify
```

## Test Types

### Unit Tests
- Test individual components and functions
- Located in `__tests__` directories
- Use Jest and React Testing Library

Example:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Tests
- Test component interactions
- Focus on feature workflows
- Use Cypress for E2E testing

Example:
```typescript
describe('Booking Flow', () => {
  it('completes a successful booking', () => {
    cy.visit('/services');
    cy.get('[data-testid="service-card"]').first().click();
    cy.get('[data-testid="book-button"]').click();
    cy.get('[data-testid="date-picker"]').click();
    cy.get('.available-slot').first().click();
    cy.get('[data-testid="confirm-booking"]').click();
    cy.url().should('include', '/booking-confirmation');
  });
});
```

### AR Component Tests
- Use specialized AR testing utilities
- Test 3D model loading and rendering
- Verify AR interactions

Example:
```typescript
import { renderARComponent, ARTestHelper } from '@/test-utils/ar-test-utils';
import { ARViewer } from '@/components/ar/ARViewer';

describe('AR Viewer', () => {
  it('loads and renders 3D model', async () => {
    const { container } = renderARComponent(
      <ARViewer modelUrl="/models/hairstyle.glb" />
    );
    
    // Wait for model to load
    await screen.findByTestId('ar-scene');
    
    // Verify model position
    const position = ARTestHelper.createTestVector(0, 1.5, 0);
    expect(ARTestHelper.isWithinBounds(position, {
      min: ARTestHelper.createTestVector(-0.1, 1.4, -0.1),
      max: ARTestHelper.createTestVector(0.1, 1.6, 0.1)
    })).toBe(true);
  });
});
```

### Performance Tests
- Load testing with autocannon
- AR performance benchmarks
- Bundle size monitoring

Example:
```typescript
import { ARPerformanceTest } from '@/test-utils/ar-test-utils';

describe('AR Performance', () => {
  it('maintains target frame rate', () => {
    const perfTest = new ARPerformanceTest();
    perfTest.startMeasurement();
    
    // Perform AR operations
    
    perfTest.endMeasurement('render-frame');
    perfTest.assertPerformance(16); // Target: 60fps (16ms per frame)
  });
});
```

## Testing Tools

### Core Testing Tools
- Jest: Unit and integration testing
- React Testing Library: Component testing
- Cypress: E2E testing
- Playwright: Cross-browser testing
- autocannon: Load testing

### AR Testing Tools
- @react-three/test-renderer: Three.js testing
- AR test utilities
- Performance monitoring tools

### Performance Testing Tools
- Lighthouse CI
- Bundle analyzer
- Custom performance metrics

## Writing Tests

### Best Practices
1. Follow AAA pattern (Arrange, Act, Assert)
2. Use meaningful test descriptions
3. Test edge cases and error conditions
4. Keep tests focused and isolated
5. Use appropriate test doubles (mocks, stubs)

### Test Structure
```typescript
describe('Component/Feature Name', () => {
  // Setup (beforeAll, beforeEach)
  beforeEach(() => {
    // Common setup
  });

  // Happy path tests
  it('works with valid input', () => {
    // Test implementation
  });

  // Edge cases
  it('handles empty input', () => {
    // Test implementation
  });

  // Error cases
  it('handles invalid input', () => {
    // Test implementation
  });

  // Cleanup (afterEach, afterAll)
  afterEach(() => {
    // Common cleanup
  });
});
```

## AR Testing

### Model Testing
- Verify model loading
- Check transformations
- Test interactions
- Measure performance

### AR Session Testing
- Test session initialization
- Verify camera access
- Check tracking quality
- Test gestures and interactions

### Performance Testing
- Frame rate monitoring
- Memory usage tracking
- Asset loading time
- Interaction latency

## Performance Testing

### Load Testing
```bash
# Run all load tests
npm run test:load

# Run specific scenario
npm run test:load -- --scenario=booking

# Generate load test report
npm run test:load -- --report
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze:bundle

# Check specific chunks
npm run analyze:bundle -- --chunk=ar
```

### Monitoring
```bash
# Start monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# View metrics
open http://localhost:3000/monitoring
```

## Security Testing

### WAF Testing
- Test against known attack patterns
- Verify IP blocking
- Check rate limiting
- Test rule effectiveness

### API Security
- Test authentication
- Verify authorization
- Check input validation
- Test rate limiting

## CI/CD Integration

### GitHub Actions
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:ar
          npm run test:performance
          
      - name: Upload coverage
        uses: actions/upload-artifact@v2
        with:
          name: coverage
          path: coverage/
```

### Automated Checks
- Unit test coverage
- Integration test status
- Performance benchmarks
- Security scans
- Bundle size limits

## Additional Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)
- [Three.js Testing](https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally)
- [Performance Testing Guide](./PERFORMANCE-TESTING.md)
- [Security Testing Guide](./SECURITY-TESTING.md) 