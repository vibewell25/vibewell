# Consolidated Implementation Guide

## Overview

This guide serves as the single source of truth for implementing features in the VibeWell platform. It consolidates information from various implementation guides and provides a unified approach to development.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Component Implementation](#component-implementation)
3. [State Management](#state-management)
4. [Form Validation](#form-validation)
5. [API Integration](#api-integration)
6. [Testing Strategy](#testing-strategy)
7. [Authentication Implementation](#authentication-implementation)
8. [Accessibility Compliance](#accessibility-compliance)
9. [Performance Optimization](#performance-optimization)
10. [Deployment](#deployment)

## Getting Started

### Prerequisites

Before you begin implementing features, ensure you have:

1. Set up your development environment
2. Reviewed the system architecture
3. Familiarized yourself with the component library
4. Understood the coding standards

### Development Workflow

1. Create a feature branch from `main`
2. Implement your changes following this guide
3. Write tests for your implementation
4. Run the linter and type-checker
5. Submit a pull request for review

## Component Implementation

### Using Standardized Components

VibeWell has standardized UI components located in `src/components/ui/`. Always use these components rather than creating duplicates. Key components include:

- `Button`: Use for all actionable elements
- `Form`: Use for all forms and form elements
- `Dialog`: Use for modal interfaces
- `Card`: Use for content containers

Example of using the Button component:

```tsx
import { Button } from '@/components/ui/button';

function MyComponent() {
  return (
    <Button variant="default" size="md" onClick={handleClick}>
      Click Me
    </Button>
  );
}
```

### Creating New Components

When creating new components:

1. **Determine the Scope**:
   - UI component? Place it in `src/components/ui/`
   - Feature-specific component? Place it in `src/components/[feature]/`
   - Layout component? Place it in `src/components/layout/`

2. **Follow the Component Template**:
   ```tsx
   import React from 'react';
   
   interface ComponentProps {
     // Define props with TypeScript interfaces
     label: string;
     onClick?: () => void;
   }
   
   /**
    * Component description
    */
   export function Component({ label, onClick }: ComponentProps) {
     return (
       <div>
         <button onClick={onClick}>{label}</button>
       </div>
     );
   }
   ```

3. **Create Tests**:
   - Unit tests for functionality
   - Accessibility tests for a11y compliance

## State Management

### State Categories

In VibeWell, we categorize state into four main types:

1. **Server State**: Data fetched from APIs (users, bookings, services)
2. **UI State**: Visual state (modal visibility, active tabs, form inputs)
3. **Navigation State**: Current route, history, and parameters
4. **Session State**: User authentication, preferences, and settings

### Server State with React Query

Use React Query for server state management:

```typescript
// src/hooks/useServices.ts
import { useQuery } from 'react-query';
import apiClient from '@/utils/api-client';

export function useServices() {
  return useQuery(
    ['services'],
    async () => {
      const response = await apiClient.get('/services');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    }
  );
}
```

### UI State with React Context

For UI state that spans multiple components, use React Context:

```typescript
// src/contexts/UIContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);
  
  return (
    <UIContext.Provider
      value={{
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
}
```

### Local Component State

For simple component-level state, use `useState`:

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

For complex component state, use `useReducer`:

```tsx
import { useReducer } from 'react';

type State = { count: number; lastUpdated: Date };
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, lastUpdated: new Date() };
    case 'decrement':
      return { count: state.count - 1, lastUpdated: new Date() };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, lastUpdated: new Date() });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Last updated: {state.lastUpdated.toLocaleTimeString()}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
    </div>
  );
}
```

## Form Validation

### Using Form Validation Utility

VibeWell uses a standard form validation utility based on Zod:

```tsx
import { z } from 'zod';
import { validateForm } from '@/utils/form-validation';

// Define validation schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

// Type inference
type UserFormData = z.infer<typeof userSchema>;

function SignUpForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationResult = validateForm(formData, userSchema);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    // Proceed with form submission
    submitForm(formData);
  };
  
  // Rest of the component
}
```

### Common Validation Patterns

#### Required Fields

```typescript
const schema = z.object({
  requiredField: z.string().min(1, 'This field is required')
});
```

#### Email Validation

```typescript
const schema = z.object({
  email: z.string().email('Please enter a valid email address')
});
```

#### Password Validation

```typescript
const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});
```

## API Integration

### API Client Setup

Use the standardized API client:

```typescript
// src/utils/api-client.ts
import axios from 'axios';
import { getAuthToken } from './auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};
    
    // Handle authentication errors
    if (status === 401) {
      // Clear authentication data and redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Hooks

Create custom hooks for API operations:

```typescript
// src/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiClient from '@/utils/api-client';

export function useBookings() {
  const queryClient = useQueryClient();
  
  // Fetch bookings
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useQuery(['bookings'], async () => {
    const response = await apiClient.get('/bookings');
    return response.data;
  });
  
  // Create booking mutation
  const createBooking = useMutation(
    async (newBooking) => {
      const response = await apiClient.post('/bookings', newBooking);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch bookings list
        queryClient.invalidateQueries(['bookings']);
      },
    }
  );
  
  return {
    bookings,
    isLoading,
    error,
    createBooking: createBooking.mutate,
    isCreating: createBooking.isLoading,
    createError: createBooking.error,
  };
}
```

## Testing Strategy

### Testing Approach

Follow the testing pyramid approach:

1. **Unit Tests**: Many small, fast tests at the function/component level
2. **Integration Tests**: Medium number of tests verifying component interactions
3. **End-to-End Tests**: Fewer tests simulating real user behavior

### Component Testing

Use React Testing Library for component testing:

```tsx
// src/components/Button/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Testing

Test API interactions with Mock Service Worker (MSW):

```typescript
// src/features/services/__tests__/servicesApi.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClientProvider } from 'react-query';
import { useServices } from '../servicesApi';

// Mock server setup
const server = setupServer(
  rest.get('*/api/services', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', name: 'Massage', price: 80 },
        { id: '2', name: 'Yoga', price: 50 },
      ])
    );
  })
);

// Tests...
```

## Authentication Implementation

### Using Authentication Hook

Use the unified authentication hook:

```tsx
import { useAuth } from '@/hooks/use-unified-auth';

function AuthenticatedComponent() {
  const { user, isLoading, signOut } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in to view this content.</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

Implement protected routes using Next.js middleware:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Check if the user is authenticated
  const verifiedToken = token && await verifyAuth(token);
  
  // Protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/profile');
  
  if (isProtectedRoute && !verifiedToken) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
};
```

## Accessibility Compliance

### Key Principles

Follow these accessibility principles:

1. **Semantic HTML**: Use proper HTML elements
2. **Keyboard Navigation**: Ensure all functionality is keyboard accessible
3. **Screen Reader Support**: Use ARIA attributes when needed
4. **Color Contrast**: Maintain sufficient contrast ratios
5. **Focus Management**: Properly manage focus, especially in modals

### Accessible Component Example

```tsx
// src/components/AccessibleAccordion.tsx
import React, { useState } from 'react';
import { useId } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

function AccordionItem({ title, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const headingId = `${id}-heading`;
  const contentId = `${id}-content`;
  
  return (
    <div className="accordion-item">
      <h3>
        <button
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen(!isOpen)}
          className="accordion-button"
        >
          {title}
          <span className="visually-hidden">{isOpen ? 'Collapse' : 'Expand'}</span>
          <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headingId}
        hidden={!isOpen}
        className="accordion-content"
      >
        {children}
      </div>
    </div>
  );
}
```

## Performance Optimization

### Memoization

Use memoization to prevent unnecessary re-renders:

```tsx
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data, filter }) {
  // Memoize filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => item.category === filter);
  }, [data, filter]);
  
  // Memoize handler functions
  const handleClick = useCallback(() => {
    console.log('Item clicked');
  }, []);
  
  return (
    <ul>
      {filteredData.map(item => (
        <li key={item.id} onClick={handleClick}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### Code Splitting

Use dynamic imports for code splitting:

```tsx
import dynamic from 'next/dynamic';

// Dynamically import a component
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable server-side rendering if needed
});

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <DynamicComponent />
    </div>
  );
}
```

## Deployment

### Deployment Process

1. **Build**: Run the build command to create a production-ready bundle
   ```bash
   npm run build
   ```

2. **Test**: Run tests to ensure everything works as expected
   ```bash
   npm run test
   ```

3. **Deploy**: Deploy the application to the appropriate environment
   ```bash
   npm run deploy:prod
   ```

### Environment Configuration

Use environment variables for configuration:

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_DOMAIN=dev-auth.vibewell.com

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.vibewell.com
NEXT_PUBLIC_AUTH_DOMAIN=auth.vibewell.com
```

## Conclusion

This consolidated guide provides a unified approach to implementing features in the VibeWell platform. Always refer to this guide when developing new features or modifying existing ones.

## Related Documents

- [System Architecture](../architecture/system-architecture.md)
- [Component Library](./ui-component-library.md)
- [API Documentation](../api/api-documentation-guide.md)
- [Testing Guide](./testing-guide.md)
- [Accessibility Guide](../accessibility/accessibility-guide.md) 