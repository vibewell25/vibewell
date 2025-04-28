# Vibewell Testing Infrastructure

This document explains how to use the enhanced testing infrastructure for the Vibewell project.

## Setup

To set up the testing infrastructure, run:

```bash
npm run test:setup
```

This will install the necessary dependencies and configure the test environment.

## Running Tests

### Enhanced Testing Commands

The project now provides enhanced testing commands:

```bash
# Run all tests with the enhanced configuration
npm run test:enhanced

# Run tests in watch mode with the enhanced configuration
npm run test:enhanced:watch

# Run tests with coverage reports
npm run test:enhanced:coverage
```

### Verifying Test Infrastructure

To verify that the test infrastructure is properly set up:

```bash
./scripts/test-infrastructure.sh
```

## Testing Utilities

We've added several testing utilities to make testing easier:

- **TypeScript Declarations**: Type definitions for jest-dom, jest-axe, and user-event.
- **Mock Files**: Mocks for Three.js, images, styles, and other resources.
- **Enhanced Jest Setup**: A setup file that includes common testing utilities.
- **Testing Utilities**: Helper functions for common testing tasks in `src/test-utils/testing-utils.ts`.

## Writing Tests

### Component Tests

Use the following pattern for component tests:

```tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Accessibility Tests

To test for accessibility:

```tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<ComponentName />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### API Tests

Use MSW to mock API responses:

```tsx
import { render, screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '../test-utils/server';
import { ApiComponent } from './api-component';

beforeAll(() => {
  server.use(
    http.get('/api/endpoint', () => {
      return HttpResponse.json({ data: 'mocked data' });
    })
  );
});

describe('ApiComponent', () => {
  it('should render API data', async () => {
    render(<ApiComponent />);
    expect(await screen.findByText('mocked data')).toBeInTheDocument();
  });
});
```

## Mocking External Dependencies

### Three.js

The project includes mocks for Three.js and its loaders:

```tsx
// This will use the mock implementation
import { Scene, Camera } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
```

### CSS and Asset Imports

CSS and asset imports are automatically mocked:

```tsx
// These imports will be mocked
import styles from './styles.module.css';
import image from './image.png';
```

## Troubleshooting

If you encounter issues with tests:

1. Make sure all dependencies are installed: `npm run test:setup`
2. Verify the test infrastructure: `./scripts/test-infrastructure.sh`
3. Check for TypeScript errors: `npm run type-check`
4. Look for syntax errors or incorrect imports 