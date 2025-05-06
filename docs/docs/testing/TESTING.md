# VibeWell Testing Guide

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

---
*Other TESTING-*.md variants have been consolidated into this guide and removed.*# End-to-End Testing Guide

This guide outlines the end-to-end (E2E) testing approach for the VibeWell application. E2E tests verify the application's critical user flows from start to finish, ensuring that all components work together as expected in real-world scenarios.

## Overview

E2E tests simulate real user interactions with the application, testing complete business processes across multiple pages and components. These tests provide confidence that the entire system functions correctly from a user's perspective.

### Test Coverage

Our E2E tests focus on critical user flows:

- **Business Profile Creation**: Testing the complete flow of creating and managing a business profile
- **Booking Flow**: Verifying the entire booking process from search to confirmation
- **Authentication**: Testing user registration, login, and account management
- **Service Management**: Testing service creation, updating, and deletion
- **Provider Discovery**: Testing search and filtering functionality

## Implementation

E2E tests are implemented using:

- **Jest**: Test runner and assertion library
- **Axios**: HTTP client for making requests to the API
- **MSW (Mock Service Worker)**: For intercepting and mocking API requests
- **Jest DOM**: For DOM-related assertions

### Test Structure

E2E tests follow this structure:

1. **Setup**: Initialize the test environment and mock necessary services
2. **Execute**: Perform the actions that make up the user flow
3. **Verify**: Assert that the expected outcomes occur
4. **Cleanup**: Reset the test environment

## Running E2E Tests

E2E tests can be run using the following commands:

```bash
# Run all E2E tests
npx jest tests/post-deploy

# Run a specific E2E test
npx jest tests/post-deploy/business-profile-creation.test.ts

# Run E2E tests with the comprehensive test suite
./scripts/run-tests.sh
```

## Writing New E2E Tests

When writing new E2E tests:

1. **Identify Critical Flows**: Focus on high-value user journeys
2. **Mock External Dependencies**: Use MSW to intercept and mock API requests
3. **Isolate Tests**: Each test should be independent and not rely on state from other tests
4. **Cover Edge Cases**: Test both happy paths and error scenarios
5. **Keep Tests Maintainable**: Use page objects or similar patterns to isolate UI changes

### Example Test

Here's a simplified example of an E2E test for business profile creation:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('Business Profile Creation Flow', () => {
  beforeEach(() => {
    // Set up mocks
    server.use(
      // Mock API responses
    );
  });

  it('Should allow a provider to create a business profile', async () => {
    // Test the complete flow
    // 1. Login as provider
    // 2. Access profile creation page
    // 3. Submit profile data
    // 4. Verify the profile was created
  });
});
```

## CI/CD Integration

E2E tests run automatically in our CI/CD pipeline:

- Tests run on pull requests before merging
- Tests run on the main branch after merging
- Failed tests prevent deployment

## Troubleshooting

Common issues with E2E tests:

- **Flaky Tests**: Tests that sometimes pass and sometimes fail
  - Solution: Review timeouts, avoid dependencies between tests, and use retries

- **Slow Tests**: Tests that take too long to run
  - Solution: Use more specific selectors, limit test scope, or parallelize tests

- **Maintenance Burden**: Tests that break due to UI changes
  - Solution: Use stable selectors, page objects, and abstract UI details # Integration Testing Guide

This guide covers integration testing for the VibeWell application, with a particular focus on backup and recovery functionality. Integration tests validate that different components of the system work together as expected.

## Overview

Integration tests verify the interactions between different parts of the application, ensuring that data flows correctly between services and components. Unlike unit tests that test components in isolation, integration tests examine how components behave together.

### Test Focus Areas

Our integration tests focus on several critical systems:

- **Backup and Recovery System**: Testing the complete backup creation, verification, and restoration process
- **Authentication Flow**: Testing the interaction between authentication services and user management
- **Payment Processing**: Testing the integration with payment gateways and order management
- **Notification System**: Testing the delivery of notifications across different channels
- **External API Integrations**: Testing connections to third-party services

## Backup and Recovery Testing

The backup and recovery system is critical for data resilience and business continuity. Our integration tests verify:

### Backup Process
- **Backup Creation**: Testing the creation of full and incremental backups
- **Data Integrity**: Verifying that backups contain all required data
- **Encryption**: Testing that sensitive data is properly encrypted
- **Compression**: Verifying efficient storage through compression
- **Storage Integration**: Testing uploads to local storage and cloud providers

### Recovery Process
- **Backup Verification**: Testing the integrity validation of backups before restoration
- **Data Restoration**: Verifying complete and accurate restoration of backed-up data
- **Error Handling**: Testing recovery from corrupted or incomplete backups
- **Performance**: Measuring restoration times under different data loads
- **Post-Recovery Validation**: Verifying system integrity after recovery

## Implementation

Integration tests use:

- **Jest**: Test runner and assertion framework
- **Mocks**: For simulating external dependencies
- **Test Database**: Isolated database for testing
- **Supabase Testing**: Mocked Supabase client for testing database interactions

### Test Structure

A typical integration test follows this structure:

1. **Setup**: Initialize test environment and dependencies
2. **Execute**: Run the integrated components
3. **Verify**: Check that the expected interactions occur
4. **Cleanup**: Reset the test environment

## Running Integration Tests

Integration tests can be run using:

```bash
# Run all integration tests
npx jest tests/integration

# Run specific integration tests
npx jest tests/integration/backup-recovery.test.ts

# Run as part of the complete test suite
./scripts/run-tests.sh
```

## Writing New Integration Tests

When writing new integration tests:

1. **Identify Integration Points**: Focus on interfaces between components
2. **Mock External Dependencies**: Simulate third-party services
3. **Set Up Test Data**: Use fixtures or factories to create consistent test data
4. **Test Error Scenarios**: Verify behavior when integrations fail
5. **Clean Up Test Data**: Ensure tests don't affect subsequent test runs

### Example Test

Here's a simplified example of a backup and recovery integration test:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BackupService } from '@/lib/backup/backup-service';

describe('Backup and Recovery Integration', () => {
  let backupService;
  
  beforeEach(() => {
    // Set up test environment and mock dependencies
  });
  
  it('should create and restore a backup successfully', async () => {
    // Create backup
    const backupResult = await backupService.createBackup();
    expect(backupResult.success).toBe(true);
    
    // Verify backup
    const isValid = await backupService.verifyBackup(backupResult.backupId);
    expect(isValid).toBe(true);
    
    // Restore backup
    await backupService.restoreBackup(backupResult.backupId);
    
    // Verify restoration
    // Check that data was properly restored
  });
});
```

## Best Practices

- **Isolate Tests**: Each test should be independent
- **Use Test Databases**: Don't test against production databases
- **Mock External Services**: Avoid dependencies on external systems
- **Test Realistic Scenarios**: Focus on real-world integration patterns
- **Monitor Test Performance**: Integration tests should be reasonably fast

## Troubleshooting

Common issues with integration tests:

- **Test Interdependence**: Tests that depend on the state from other tests
  - Solution: Reset state between tests and use unique identifiers

- **External Service Dependencies**: Tests that fail due to external service availability
  - Solution: Use consistent mocks and fallbacks

- **Slow Tests**: Tests that take too long due to integration complexity
  - Solution: Focus on critical paths and use selective mocking # Mobile Web Compatibility Testing Guide

This document outlines the comprehensive approach for testing and optimizing VibeWell's mobile experience across various device types.

## Testing Devices

### Minimum Device Coverage

Test across the following device types:

| Category | Devices |
|----------|---------|
| **iOS** | iPhone SE, iPhone 12/13/14, iPhone Pro Max, iPad Mini, iPad Pro |
| **Android** | Google Pixel (small), Samsung S21/S22 (medium), Samsung Note/Ultra (large), Samsung Tab |
| **Other** | A low-end Android device (e.g., Nokia, Motorola) |

### Operating System Versions

- **iOS**: Latest version and latest-1 (minimum)
- **Android**: Latest version, latest-1, and a representative of an older version (e.g., Android 9)

### Browsers

- **iOS**: Safari, Chrome
- **Android**: Chrome, Samsung Internet
- **All**: Firefox Mobile

## Testing Methodology

### 1. Responsive Layout Testing

- **Portrait and Landscape**: Test in both orientations
- **Layout Integrity**: Check for misaligned elements, overflow, cut-off content
- **Navigation**: Verify hamburger menu functions, navigation is accessible
- **Forms**: Test form inputs, keyboards, and form submission
- **Media**: Ensure images and videos are properly sized and load correctly

### 2. Touch Interaction Testing

- **Touch Targets**: Verify all interactive elements are at least 44×44px
- **Gesture Support**: Test pinch zoom, swipe, and other gestures where implemented
- **Tap Accuracy**: Ensure precise taps work for smaller elements
- **Touch Feedback**: Visual feedback for touch interactions is present
- **Multi-touch**: Test features requiring multiple touch points (where applicable)

### 3. Performance Testing on Mobile

- **Initial Load Time**: Measure using Chrome DevTools or Safari Web Inspector
- **Scrolling Performance**: Check for smooth scrolling, no jank
- **Animation Performance**: Verify animations run smoothly (60fps target)
- **Memory Usage**: Monitor for memory leaks, especially on low-end devices
- **Battery Impact**: Test extended use on unplugged device

### 4. Network Conditions Testing

- **Offline Behavior**: Test with airplane mode to verify graceful handling
- **Slow Connection**: Use browser throttling tools to simulate 3G conditions
- **Network Interruptions**: Test application behavior during connection changes
- **Data Efficiency**: Monitor bandwidth usage for key user flows

## Testing Checklist

### Visual Design & Layout

- [ ] Content fits within viewport without horizontal scrolling
- [ ] Text is readable without zooming (min 16px font size)
- [ ] Sufficient contrast for outdoor visibility
- [ ] Appropriate spacing of touchable elements
- [ ] All UI elements visible in both light and dark mode
- [ ] No text overlapping or truncation

### Functionality

- [ ] All features usable on mobile browsers
- [ ] Navigation menus work properly on all screen sizes
- [ ] Forms can be completed on mobile (including complex inputs)
- [ ] Modals and overlays properly sized and dismissible
- [ ] Media plays correctly (avoid autoplay with sound)
- [ ] Third-party components (maps, embeds) work properly

### Performance

- [ ] Initial page load < 3 seconds on 4G
- [ ] Time to Interactive < 5 seconds on 4G
- [ ] Smooth scrolling without janky behavior
- [ ] Images optimized with appropriate sizes
- [ ] Responsive image techniques used
- [ ] No unnecessary animations on mobile

### Mobile-Specific

- [ ] Phone numbers are clickable to initiate calls
- [ ] Addresses link to maps
- [ ] Email addresses open mail client
- [ ] App-specific deep links work correctly
- [ ] PWA features implemented correctly (if applicable)
- [ ] Proper viewport meta tag implemented

## Testing Process

### 1. Device Lab Setup

1. Maintain a collection of physical devices for testing
2. Install all target browsers on each device
3. Set up remote debugging where possible:
   - iOS: Safari Web Inspector via macOS
   - Android: Chrome DevTools Remote Debugging

### 2. Automation Tools

- **BrowserStack/Sauce Labs**: Remote device testing
- **Appium**: For automated mobile web tests
- **Lighthouse**: Performance and PWA auditing
- **WebPageTest**: Performance testing across real devices

### 3. Accessibility Verification

- Test with VoiceOver (iOS) and TalkBack (Android)
- Verify screen reader can access all content
- Test operation without reliance on complex gestures

## Performance Optimization Techniques

### Image Optimization

- Implement responsive images using `srcset` and `sizes`
- Use modern formats (WebP with JPEG fallbacks)
- Consider lazy loading for below-the-fold images

```jsx
<picture>
  <source type="image/webp" srcSet="/images/photo.webp" />
  <source type="image/jpeg" srcSet="/images/photo.jpg" />
  <img 
    src="/images/photo.jpg" 
    alt="Description" 
    width="800" 
    height="600"
    loading="lazy" 
  />
</picture>
```

### CSS Optimization

- Use mobile-first CSS approach
- Minimize CSS file size through optimization
- Prioritize above-the-fold CSS
- Consider modular loading strategies

### JavaScript Optimization

- Minimize and split JavaScript bundles
- Defer non-critical JavaScript
- Implement code-splitting for routes
- Use Web Workers for intensive processing
- Consider dynamic imports for feature modules

### Network Strategies

- Implement service workers for offline support
- Use resource hints (preconnect, preload)
- Enable HTTP/2 or HTTP/3 on production servers
- Consider CDN for static assets

### Progressive Enhancement

- Ensure core functionality works without JavaScript
- Layer enhancement for capable browsers
- Detect device capabilities before using advanced features

## User Testing

For each major release, conduct:

1. **Usability Testing**: With real users on their personal mobile devices
2. **A/B Testing**: For key mobile interactions
3. **Real-User Monitoring**: Using analytics to identify issues

## Reporting

When filing a mobile compatibility issue:

1. Specify:
   - Device make and model
   - OS version
   - Browser and version
   - Network conditions
   - Steps to reproduce
   - Screenshots/video
2. Rate severity:
   - P0: Renders app unusable on major device segment
   - P1: Feature broken or unusable on mobile
   - P2: UI/UX issues causing confusion
   - P3: Cosmetic issues

## Resource Allocation

Prioritize fixes based on:

1. User analytics (affected device proportion)
2. Business impact
3. Implementation complexity

## Resources

- [Web Fundamentals Mobile Guide](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [MDN Responsive Design Guide](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Chrome DevTools Mobile Simulation](https://developers.google.com/web/tools/chrome-devtools/device-mode)
- [Safari Web Development Tools](https://developer.apple.com/safari/tools/)
- [WebPageTest](https://www.webpagetest.org/)
- [Mobile Testing on BrowserStack](https://www.browserstack.com/guide/mobile-testing) # End-to-End Testing Guide

This guide outlines the end-to-end (E2E) testing approach for the VibeWell application. E2E tests verify the application's critical user flows from start to finish, ensuring that all components work together as expected in real-world scenarios.

## Overview

E2E tests simulate real user interactions with the application, testing complete business processes across multiple pages and components. These tests provide confidence that the entire system functions correctly from a user's perspective.

### Test Coverage

Our E2E tests focus on critical user flows:

- **Business Profile Creation**: Testing the complete flow of creating and managing a business profile
- **Booking Flow**: Verifying the entire booking process from search to confirmation
- **Authentication**: Testing user registration, login, and account management
- **Service Management**: Testing service creation, updating, and deletion
- **Provider Discovery**: Testing search and filtering functionality

## Implementation

E2E tests are implemented using:

- **Jest**: Test runner and assertion library
- **Axios**: HTTP client for making requests to the API
- **MSW (Mock Service Worker)**: For intercepting and mocking API requests
- **Jest DOM**: For DOM-related assertions

### Test Structure

E2E tests follow this structure:

1. **Setup**: Initialize the test environment and mock necessary services
2. **Execute**: Perform the actions that make up the user flow
3. **Verify**: Assert that the expected outcomes occur
4. **Cleanup**: Reset the test environment

## Running E2E Tests

E2E tests can be run using the following commands:

```bash
# Run all E2E tests
npx jest tests/post-deploy

# Run a specific E2E test
npx jest tests/post-deploy/business-profile-creation.test.ts

# Run E2E tests with the comprehensive test suite
./scripts/run-tests.sh
```

## Writing New E2E Tests

When writing new E2E tests:

1. **Identify Critical Flows**: Focus on high-value user journeys
2. **Mock External Dependencies**: Use MSW to intercept and mock API requests
3. **Isolate Tests**: Each test should be independent and not rely on state from other tests
4. **Cover Edge Cases**: Test both happy paths and error scenarios
5. **Keep Tests Maintainable**: Use page objects or similar patterns to isolate UI changes

### Example Test

Here's a simplified example of an E2E test for business profile creation:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('Business Profile Creation Flow', () => {
  beforeEach(() => {
    // Set up mocks
    server.use(
      // Mock API responses
    );
  });

  it('Should allow a provider to create a business profile', async () => {
    // Test the complete flow
    // 1. Login as provider
    // 2. Access profile creation page
    // 3. Submit profile data
    // 4. Verify the profile was created
  });
});
```

## CI/CD Integration

E2E tests run automatically in our CI/CD pipeline:

- Tests run on pull requests before merging
- Tests run on the main branch after merging
- Failed tests prevent deployment

## Troubleshooting

Common issues with E2E tests:

- **Flaky Tests**: Tests that sometimes pass and sometimes fail
  - Solution: Review timeouts, avoid dependencies between tests, and use retries

- **Slow Tests**: Tests that take too long to run
  - Solution: Use more specific selectors, limit test scope, or parallelize tests

- **Maintenance Burden**: Tests that break due to UI changes
  - Solution: Use stable selectors, page objects, and abstract UI details # Integration Testing Guide

This guide covers integration testing for the VibeWell application, with a particular focus on backup and recovery functionality. Integration tests validate that different components of the system work together as expected.

## Overview

Integration tests verify the interactions between different parts of the application, ensuring that data flows correctly between services and components. Unlike unit tests that test components in isolation, integration tests examine how components behave together.

### Test Focus Areas

Our integration tests focus on several critical systems:

- **Backup and Recovery System**: Testing the complete backup creation, verification, and restoration process
- **Authentication Flow**: Testing the interaction between authentication services and user management
- **Payment Processing**: Testing the integration with payment gateways and order management
- **Notification System**: Testing the delivery of notifications across different channels
- **External API Integrations**: Testing connections to third-party services

## Backup and Recovery Testing

The backup and recovery system is critical for data resilience and business continuity. Our integration tests verify:

### Backup Process
- **Backup Creation**: Testing the creation of full and incremental backups
- **Data Integrity**: Verifying that backups contain all required data
- **Encryption**: Testing that sensitive data is properly encrypted
- **Compression**: Verifying efficient storage through compression
- **Storage Integration**: Testing uploads to local storage and cloud providers

### Recovery Process
- **Backup Verification**: Testing the integrity validation of backups before restoration
- **Data Restoration**: Verifying complete and accurate restoration of backed-up data
- **Error Handling**: Testing recovery from corrupted or incomplete backups
- **Performance**: Measuring restoration times under different data loads
- **Post-Recovery Validation**: Verifying system integrity after recovery

## Implementation

Integration tests use:

- **Jest**: Test runner and assertion framework
- **Mocks**: For simulating external dependencies
- **Test Database**: Isolated database for testing
- **Supabase Testing**: Mocked Supabase client for testing database interactions

### Test Structure

A typical integration test follows this structure:

1. **Setup**: Initialize test environment and dependencies
2. **Execute**: Run the integrated components
3. **Verify**: Check that the expected interactions occur
4. **Cleanup**: Reset the test environment

## Running Integration Tests

Integration tests can be run using:

```bash
# Run all integration tests
npx jest tests/integration

# Run specific integration tests
npx jest tests/integration/backup-recovery.test.ts

# Run as part of the complete test suite
./scripts/run-tests.sh
```

## Writing New Integration Tests

When writing new integration tests:

1. **Identify Integration Points**: Focus on interfaces between components
2. **Mock External Dependencies**: Simulate third-party services
3. **Set Up Test Data**: Use fixtures or factories to create consistent test data
4. **Test Error Scenarios**: Verify behavior when integrations fail
5. **Clean Up Test Data**: Ensure tests don't affect subsequent test runs

### Example Test

Here's a simplified example of a backup and recovery integration test:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BackupService } from '@/lib/backup/backup-service';

describe('Backup and Recovery Integration', () => {
  let backupService;
  
  beforeEach(() => {
    // Set up test environment and mock dependencies
  });
  
  it('should create and restore a backup successfully', async () => {
    // Create backup
    const backupResult = await backupService.createBackup();
    expect(backupResult.success).toBe(true);
    
    // Verify backup
    const isValid = await backupService.verifyBackup(backupResult.backupId);
    expect(isValid).toBe(true);
    
    // Restore backup
    await backupService.restoreBackup(backupResult.backupId);
    
    // Verify restoration
    // Check that data was properly restored
  });
});
```

## Best Practices

- **Isolate Tests**: Each test should be independent
- **Use Test Databases**: Don't test against production databases
- **Mock External Services**: Avoid dependencies on external systems
- **Test Realistic Scenarios**: Focus on real-world integration patterns
- **Monitor Test Performance**: Integration tests should be reasonably fast

## Troubleshooting

Common issues with integration tests:

- **Test Interdependence**: Tests that depend on the state from other tests
  - Solution: Reset state between tests and use unique identifiers

- **External Service Dependencies**: Tests that fail due to external service availability
  - Solution: Use consistent mocks and fallbacks

- **Slow Tests**: Tests that take too long due to integration complexity
  - Solution: Focus on critical paths and use selective mocking # Mobile Web Compatibility Testing Guide

This document outlines the comprehensive approach for testing and optimizing VibeWell's mobile experience across various device types.

## Testing Devices

### Minimum Device Coverage

Test across the following device types:

| Category | Devices |
|----------|---------|
| **iOS** | iPhone SE, iPhone 12/13/14, iPhone Pro Max, iPad Mini, iPad Pro |
| **Android** | Google Pixel (small), Samsung S21/S22 (medium), Samsung Note/Ultra (large), Samsung Tab |
| **Other** | A low-end Android device (e.g., Nokia, Motorola) |

### Operating System Versions

- **iOS**: Latest version and latest-1 (minimum)
- **Android**: Latest version, latest-1, and a representative of an older version (e.g., Android 9)

### Browsers

- **iOS**: Safari, Chrome
- **Android**: Chrome, Samsung Internet
- **All**: Firefox Mobile

## Testing Methodology

### 1. Responsive Layout Testing

- **Portrait and Landscape**: Test in both orientations
- **Layout Integrity**: Check for misaligned elements, overflow, cut-off content
- **Navigation**: Verify hamburger menu functions, navigation is accessible
- **Forms**: Test form inputs, keyboards, and form submission
- **Media**: Ensure images and videos are properly sized and load correctly

### 2. Touch Interaction Testing

- **Touch Targets**: Verify all interactive elements are at least 44×44px
- **Gesture Support**: Test pinch zoom, swipe, and other gestures where implemented
- **Tap Accuracy**: Ensure precise taps work for smaller elements
- **Touch Feedback**: Visual feedback for touch interactions is present
- **Multi-touch**: Test features requiring multiple touch points (where applicable)

### 3. Performance Testing on Mobile

- **Initial Load Time**: Measure using Chrome DevTools or Safari Web Inspector
- **Scrolling Performance**: Check for smooth scrolling, no jank
- **Animation Performance**: Verify animations run smoothly (60fps target)
- **Memory Usage**: Monitor for memory leaks, especially on low-end devices
- **Battery Impact**: Test extended use on unplugged device

### 4. Network Conditions Testing

- **Offline Behavior**: Test with airplane mode to verify graceful handling
- **Slow Connection**: Use browser throttling tools to simulate 3G conditions
- **Network Interruptions**: Test application behavior during connection changes
- **Data Efficiency**: Monitor bandwidth usage for key user flows

## Testing Checklist

### Visual Design & Layout

- [ ] Content fits within viewport without horizontal scrolling
- [ ] Text is readable without zooming (min 16px font size)
- [ ] Sufficient contrast for outdoor visibility
- [ ] Appropriate spacing of touchable elements
- [ ] All UI elements visible in both light and dark mode
- [ ] No text overlapping or truncation

### Functionality

- [ ] All features usable on mobile browsers
- [ ] Navigation menus work properly on all screen sizes
- [ ] Forms can be completed on mobile (including complex inputs)
- [ ] Modals and overlays properly sized and dismissible
- [ ] Media plays correctly (avoid autoplay with sound)
- [ ] Third-party components (maps, embeds) work properly

### Performance

- [ ] Initial page load < 3 seconds on 4G
- [ ] Time to Interactive < 5 seconds on 4G
- [ ] Smooth scrolling without janky behavior
- [ ] Images optimized with appropriate sizes
- [ ] Responsive image techniques used
- [ ] No unnecessary animations on mobile

### Mobile-Specific

- [ ] Phone numbers are clickable to initiate calls
- [ ] Addresses link to maps
- [ ] Email addresses open mail client
- [ ] App-specific deep links work correctly
- [ ] PWA features implemented correctly (if applicable)
- [ ] Proper viewport meta tag implemented

## Testing Process

### 1. Device Lab Setup

1. Maintain a collection of physical devices for testing
2. Install all target browsers on each device
3. Set up remote debugging where possible:
   - iOS: Safari Web Inspector via macOS
   - Android: Chrome DevTools Remote Debugging

### 2. Automation Tools

- **BrowserStack/Sauce Labs**: Remote device testing
- **Appium**: For automated mobile web tests
- **Lighthouse**: Performance and PWA auditing
- **WebPageTest**: Performance testing across real devices

### 3. Accessibility Verification

- Test with VoiceOver (iOS) and TalkBack (Android)
- Verify screen reader can access all content
- Test operation without reliance on complex gestures

## Performance Optimization Techniques

### Image Optimization

- Implement responsive images using `srcset` and `sizes`
- Use modern formats (WebP with JPEG fallbacks)
- Consider lazy loading for below-the-fold images

```jsx
<picture>
  <source type="image/webp" srcSet="/images/photo.webp" />
  <source type="image/jpeg" srcSet="/images/photo.jpg" />
  <img 
    src="/images/photo.jpg" 
    alt="Description" 
    width="800" 
    height="600"
    loading="lazy" 
  />
</picture>
```

### CSS Optimization

- Use mobile-first CSS approach
- Minimize CSS file size through optimization
- Prioritize above-the-fold CSS
- Consider modular loading strategies

### JavaScript Optimization

- Minimize and split JavaScript bundles
- Defer non-critical JavaScript
- Implement code-splitting for routes
- Use Web Workers for intensive processing
- Consider dynamic imports for feature modules

### Network Strategies

- Implement service workers for offline support
- Use resource hints (preconnect, preload)
- Enable HTTP/2 or HTTP/3 on production servers
- Consider CDN for static assets

### Progressive Enhancement

- Ensure core functionality works without JavaScript
- Layer enhancement for capable browsers
- Detect device capabilities before using advanced features

## User Testing

For each major release, conduct:

1. **Usability Testing**: With real users on their personal mobile devices
2. **A/B Testing**: For key mobile interactions
3. **Real-User Monitoring**: Using analytics to identify issues

## Reporting

When filing a mobile compatibility issue:

1. Specify:
   - Device make and model
   - OS version
   - Browser and version
   - Network conditions
   - Steps to reproduce
   - Screenshots/video
2. Rate severity:
   - P0: Renders app unusable on major device segment
   - P1: Feature broken or unusable on mobile
   - P2: UI/UX issues causing confusion
   - P3: Cosmetic issues

## Resource Allocation

Prioritize fixes based on:

1. User analytics (affected device proportion)
2. Business impact
3. Implementation complexity

## Resources

- [Web Fundamentals Mobile Guide](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [MDN Responsive Design Guide](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Chrome DevTools Mobile Simulation](https://developers.google.com/web/tools/chrome-devtools/device-mode)
- [Safari Web Development Tools](https://developer.apple.com/safari/tools/)
- [WebPageTest](https://www.webpagetest.org/)
- [Mobile Testing on BrowserStack](https://www.browserstack.com/guide/mobile-testing) 