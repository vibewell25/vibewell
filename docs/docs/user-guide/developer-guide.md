# VibeWell Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Key Technologies](#key-technologies)
5. [Development Workflow](#development-workflow)
6. [API Documentation](#api-documentation)
7. [Component Library](#component-library)
8. [State Management](#state-management)
9. [Testing](#testing)
10. [AR Feature Development](#ar-feature-development)
11. [Performance Optimization](#performance-optimization)
12. [Deployment](#deployment)
13. [Security Guidelines](#security-guidelines)
14. [Contribution Guidelines](#contribution-guidelines)
15. [Troubleshooting](#troubleshooting)

## Architecture Overview

VibeWell follows a modern web application architecture with the following key elements:

- **Frontend**: Next.js-based Single Page Application (SPA)
- **Backend**: RESTful API services with Node.js (%NODE_VERSION%)
- **Database**: MongoDB for main data storage, Redis for caching
- **Authentication**: JWT-based auth system with role-based access control
- **File Storage**: AWS S3 for user-generated content and assets
- **AR Features**: WebXR API and Three.js for 3D rendering

The application uses a microservices architecture for key components:
- User Service
- Booking Service
- Provider Service
- Content Service
- AR Processing Service
- Analytics Service
- Payment Processing Service

## Development Environment Setup

### Prerequisites

- Node.js (%NODE_VERSION%)
- npm (v8.x or higher)
- Git
- MongoDB (local or accessible instance)
- Redis (optional, for development)
- AWS CLI (configured with appropriate credentials)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/vibewell/vibewell-platform.git
   cd vibewell-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit the `.env.local` file with your local configuration.

4. Download sample AR models for development:
   ```bash
   npm run download-models
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Editor Setup

We recommend using VS Code with the following extensions:
- ESLint
- Prettier
- TypeScript Hero
- Jest
- React Developer Tools

## Project Structure

```
vibewell/
├── public/               # Static assets
│   ├── models/           # 3D models for AR features
│   │   ├── images/           # Static images
│   │   └── locales/          # Internationalization files
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── ar/           # AR-specific components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── booking/      # Booking-related components
│   │   │   ├── business/     # Business profile components
│   │   │   ├── common/       # Common UI components
│   │   │   ├── content/      # Content management components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── profile/      # User profile components
│   │   │   └── ui/           # UI toolkit components
│   │   ├── contexts/         # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and libraries
│   │   ├── pages/            # Next.js pages
│   │   ├── services/         # API service interfaces
│   │   ├── styles/           # Global styles and theme
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Helper utilities
│   ├── scripts/              # Build and deployment scripts
│   ├── tests/                # Test files
│   │   ├── unit/             # Unit tests
│   │   ├── integration/      # Integration tests
│   │   └── e2e/              # End-to-end tests
│   ├── cypress/              # Cypress e2e test configuration
│   ├── config/               # Configuration files
│   └── docs/                 # Documentation
```

## Key Technologies

The VibeWell platform utilizes the following core technologies:

### Frontend
- **React**: UI library
- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Three.js**: 3D rendering library
- **react-hook-form**: Form handling
- **SWR**: Data fetching and caching
- **Zustand**: State management

### Backend
- **Node.js**: JavaScript runtime (v18.x or later)
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Redis**: In-memory data structure store
- **JWT**: Authentication mechanism
- **Stripe**: Payment processing
- **AWS S3**: File storage
- **SendGrid**: Email service

### Testing & Quality
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks

## Development Workflow

### Git Workflow

We follow a GitHub Flow workflow:

1. Create a feature branch from `main`
2. Develop and test your changes
3. Push your branch and create a Pull Request (PR)
4. After code review and CI passes, merge to `main`

Branch naming convention:
- `feature/[ticket-number]-short-description`
- `bugfix/[ticket-number]-short-description`
- `hotfix/[ticket-number]-short-description`

### Code Style & Quality

- All code must pass ESLint and TypeScript checks
- Format your code with Prettier
- Write unit tests for new functionality
- Keep PRs focused and reasonably sized

### Commit Messages

Follow the Conventional Commits format:
```
type(scope): short description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Changes not affecting code
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

## API Documentation

### RESTful API Structure

VibeWell API follows RESTful conventions:

| Method | Purpose                               |
|--------|---------------------------------------|
| GET    | Retrieve resource(s)                  |
| POST   | Create a new resource                 |
| PUT    | Update a resource (full replacement)  |
| PATCH  | Partial update of a resource          |
| DELETE | Remove a resource                     |

### Authentication

All API requests (except public endpoints) require a JWT token:

```
Authorization: Bearer {token}
```

### Error Handling

API errors follow a standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional details
  }
}
```

### Common Endpoints

- **Users API**: `/api/users/*`
- **Auth API**: `/api/auth/*`
- **Bookings API**: `/api/bookings/*`
- **Providers API**: `/api/providers/*`
- **Services API**: `/api/services/*`
- **Content API**: `/api/content/*`
- **AR API**: `/api/ar/*`

For detailed API documentation, see the Swagger UI at `/api-docs` in development mode.

## Component Library

VibeWell provides a comprehensive UI component library in `src/components/ui` to maintain consistency:

### Core Components

- **Button**: `Button` - Primary interaction element with variants
- **Form Controls**: `Input`, `Select`, `Checkbox`, `RadioGroup`, etc.
- **Dialog**: `Dialog` - Modal dialog component
- **Card**: `Card` - Container component
- **Typography**: `Heading`, `Text`, `Label`
- **Navigation**: `Tabs`, `Breadcrumb`, `Pagination`
- **Feedback**: `Alert`, `Toast`, `Spinner`
- **Layout**: `Container`, `Grid`, `Stack`

### Usage Example

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const MyComponent = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Sign In</Card.Title>
      </Card.Header>
      <Card.Content>
        <Input label="Email" type="email" />
        <Input label="Password" type="password" />
      </Card.Content>
      <Card.Footer>
        <Button variant="primary">Submit</Button>
      </Card.Footer>
    </Card>
  );
};
```

## State Management

### Local State

Use React's `useState` and `useReducer` for component-level state.

### Global State

For application-wide state, we use Zustand:

```tsx
// src/store/useUserStore.ts
import create from 'zustand';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  logout: () => {
    authService.logout();
    set({ user: null });
  },
}));
```

### Server State

For data fetching and caching, use SWR:

```tsx
import useSWR from 'swr';
import { fetchBookings } from '@/services/booking-service';

function BookingsList() {
  const { data, error, isLoading } = useSWR('bookings', fetchBookings);
  
  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="error">{error.message}</Alert>;
  
  return (
    <ul>
      {data.map(booking => (
        <li key={booking.id}>{booking.serviceName}</li>
      ))}
    </ul>
  );
}
```

## Testing

### Unit Testing

Use Jest and React Testing Library for unit and component tests:

```tsx
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### End-to-End Testing

Use Cypress for end-to-end testing:

```js
// cypress/e2e/login.cy.js
describe('Login Page', () => {
  it('logs in successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-greeting"]').should('contain', 'Welcome');
  });
});
```

### Running Tests

- Unit tests: `npm run test`
- Watch mode: `npm run test:watch`
- Coverage report: `npm run test:coverage`
- E2E tests: `npm run cypress`

## AR Feature Development

### Model Requirements

- File formats: glTF/GLB (preferred), OBJ
- Polygon count: <50k for optimal performance
- Texture resolution: 1024x1024 or 2048x2048
- Materials: Standard PBR materials

### AR Component Architecture

```
src/components/ar/
├── ar-viewer.tsx          # Main AR viewer component
├── ar-controls.tsx        # User controls for AR experience
├── ar-support-check.tsx   # Detects device AR capabilities
├── model-loader.tsx       # Handles 3D model loading
└── ar-context.tsx         # Context provider for AR state
```

### Integration Example

```tsx
import { ARViewer } from "@/components/ar/ar-viewer";
import { ARControls } from "@/components/ar/ar-controls";
import { ARSupportCheck } from "@/components/ar/ar-support-check";

const VirtualTryOn = () => {
  return (
    <div>
      <ARSupportCheck>
        {(isSupported) => 
          isSupported ? (
            <>
              <ARViewer modelUrl="/models/hairstyle1.glb" />
              <ARControls />
            </>
          ) : (
            <div>Your device doesn't support AR features</div>
          )
        }
      </ARSupportCheck>
    </div>
  );
};
```

## Performance Optimization

### Bundle Size Optimization

- Use dynamic imports for code splitting
- Optimize images with next/image
- Use tree-shaking friendly imports
- Run regular bundle analysis: `npm run analyze`

### Rendering Optimization

- Use React.memo for components that render often but rarely change
- Optimize lists with stable keys and virtualization
- Avoid unnecessary re-renders with useMemo and useCallback
- Use the React DevTools Profiler to identify render bottlenecks

### AR Performance

- Use level-of-detail (LOD) models
- Implement progressive loading
- Cache downloaded models
- Optimize textures and materials
- Use the performance testing script: `npm run test:ar-performance`

## Deployment

### Environments

- **Development**: Local development environment
- **Staging**: Pre-production environment for testing
- **Production**: Live user-facing environment

### Deployment Process

1. Build the application: `npm run build`
2. Run tests: `npm run test`
3. Deploy to the appropriate environment:
   - Staging: `npm run deploy:staging`
   - Production: `npm run deploy:production`

### CI/CD

We use GitHub Actions for continuous integration and deployment:
- Automated tests run on PR creation
- Linting and type checking
- Staging deployment on merge to `develop`
- Production deployment on merge to `main`

## Security Guidelines

### Authentication & Authorization

- Use JWT tokens with appropriate expiration
- Implement RBAC (Role-Based Access Control)
- Store sensitive user data securely
- Refresh tokens should be HTTP-only cookies

### Data Validation

- Validate all user inputs on both client and server
- Use Zod schemas for TypeScript type validation
- Sanitize data to prevent XSS attacks

### API Security

- Implement rate limiting
- Use HTTPS for all communications
- Add appropriate CORS settings
- Use security headers (CSP, HSTS, etc.)

### AR Content Security

- Verify model sources
- Scan user-uploaded models
- Limit AR camera permissions appropriately

## Contribution Guidelines

### Submitting Changes

1. Create an issue or pick an existing one
2. Create a feature branch
3. Make your changes following coding standards
4. Write/update tests
5. Update documentation
6. Submit a PR with a clear description

### Code Review Process

- PR should have at least one approving review
- All CI checks must pass
- Follow up on any review comments

### Documentation Requirements

- Update relevant documentation with code changes
- Add JSDoc comments to functions and components
- Create or update README files as needed

## Troubleshooting

### Common Issues

#### Development Server Won't Start

- Check if ports are already in use
- Verify Node.js version compatibility
- Check for errors in environment variables

#### AR Features Not Working

- Ensure WebXR is supported in your browser
- Check if model files exist and are properly formatted
- Look for CORS issues with model loading

#### Authentication Problems

- Verify JWT token expiration settings
- Check for cookie settings and CORS configurations
- Ensure proper role permissions are set

### Getting Help

- Check existing GitHub issues
- Consult the internal development wiki
- Contact the lead developer via Slack 