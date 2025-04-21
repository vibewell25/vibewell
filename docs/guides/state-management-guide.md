# State Management Guide

## Overview

This guide outlines the patterns and principles for managing state in the Vibewell application. Proper state management ensures a predictable, maintainable application with optimized performance and simplified debugging.

## State Management Principles

### Core Principles

1. **Single Source of Truth**: Each piece of data should have a single, definitive source.
2. **Minimal State**: Only store what cannot be derived.
3. **Immutability**: Never directly modify state; always create new state objects.
4. **Encapsulation**: State should be accessible only through defined interfaces.
5. **Predictability**: State changes must be traceable and deterministic.

## State Categories

### Client State Categories

In Vibewell, we categorize state into four main types:

1. **Server State**: Data fetched from APIs (users, bookings, services)
2. **UI State**: Visual state (modal visibility, active tabs, form inputs)
3. **Navigation State**: Current route, history, and parameters
4. **Session State**: User authentication, preferences, and settings

## State Management Solutions

### Server State with React Query

We use [React Query](https://react-query.tanstack.com/) for managing server state:

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

### UI State with React Context

For UI state that spans multiple components:

```typescript
// src/contexts/UIContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  return (
    <UIContext.Provider
      value={{
        activeModal,
        openModal,
        closeModal,
        sidebarOpen,
        toggleSidebar,
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

Usage:

```tsx
// src/components/Header.tsx
import { useUI } from '@/contexts/UIContext';

export function Header() {
  const { toggleSidebar, openModal } = useUI();
  
  return (
    <header>
      <button onClick={toggleSidebar}>
        <MenuIcon />
      </button>
      <h1>Vibewell</h1>
      <button onClick={() => openModal('notifications')}>
        <BellIcon />
      </button>
    </header>
  );
}
```

### Component-Level State with useState and useReducer

For simple component-level state:

```tsx
// src/components/BookingForm.tsx
import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';

export function BookingForm() {
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    notes: '',
  });
  
  const { createBooking, isCreating } = useBookings();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createBooking(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
}
```

For more complex component state, use `useReducer`:

```tsx
// src/components/ShoppingCart.tsx
import { useReducer } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  total: number;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
        
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
        };
      } else {
        // New item
        const newItems = [
          ...state.items,
          { ...action.payload, quantity: 1 },
        ];
        
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };
      
    default:
      return state;
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function ShoppingCart() {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  
  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };
  
  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  return (
    <div className="shopping-cart">
      {/* Cart UI implementation */}
    </div>
  );
}
```

### Session State with Zustand

For global state like authentication, we use Zustand:

```typescript
// src/stores/authStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/utils/api-client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });
          
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Authentication failed',
          });
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      resetError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);
```

Usage:

```tsx
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function LoginForm() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  
  const { login, isLoading, error, resetError } = useAuthStore();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    resetError();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials.email, credentials.password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```

## Navigation State

### Using Next.js Router and Middleware

```tsx
// src/pages/_app.tsx
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    // Protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/bookings'];
    const isProtectedRoute = protectedRoutes.some(route => 
      router.pathname.startsWith(route)
    );
    
    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath },
      });
    }
  }, [router, isAuthenticated, isLoading]);
  
  return <Component {...pageProps} />;
}
```

## Performance Optimization

### React Query Optimization

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
      // Keep cached data for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Retry 3 times with exponential backoff
      retry: 3,
      
      // Cache previous data when refetching
      keepPreviousData: true,
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
    }
  );
}
```

### Memoization with useMemo and useCallback

```tsx
// src/components/ServiceList.tsx
import { useMemo, useCallback } from 'react';
import { useServices } from '@/hooks/useServices';

export function ServiceList({ categoryId, searchTerm }) {
  const { data: services = [], isLoading } = useServices();
  
  // Memoize filtered services
  const filteredServices = useMemo(() => {
    return services
      .filter(service => 
        (!categoryId || service.categoryId === categoryId) &&
        (!searchTerm || service.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services, categoryId, searchTerm]);
  
  // Memoize event handlers
  const handleServiceSelect = useCallback((serviceId) => {
    // Handle service selection
    console.log(`Selected service: ${serviceId}`);
  }, []);
  
  if (isLoading) return <div>Loading services...</div>;
  
  return (
    <div className="service-list">
      {filteredServices.map(service => (
        <div 
          key={service.id}
          className="service-card"
          onClick={() => handleServiceSelect(service.id)}
        >
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <span>${service.price}</span>
        </div>
      ))}
    </div>
  );
}
```

## State Management Best Practices

### When to Use Each Solution

| State Type | Solution | Use Cases |
|------------|----------|-----------|
| Server Data | React Query | API data, caching, synchronization |
| Global UI State | React Context | Themes, modals, layout settings |
| Complex Component State | useReducer | Multi-step forms, complex interactions |
| Simple Component State | useState | Toggle states, form inputs, local visibility |
| Session/Auth State | Zustand | User data, authentication, preferences |

### Debugging State

```tsx
// src/components/DebugState.tsx
import { useAuthStore } from '@/stores/authStore';
import { useUI } from '@/contexts/UIContext';

export function DebugState() {
  const { user, isAuthenticated } = useAuthStore();
  const { activeModal, sidebarOpen } = useUI();
  
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="debug-panel">
      <h3>Debug State</h3>
      <div>
        <h4>Auth State</h4>
        <pre>{JSON.stringify({ user, isAuthenticated }, null, 2)}</pre>
      </div>
      <div>
        <h4>UI State</h4>
        <pre>{JSON.stringify({ activeModal, sidebarOpen }, null, 2)}</pre>
      </div>
    </div>
  );
}
```

### Error Boundaries for State Failures

```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
export function AppWithErrorBoundary() {
  return (
    <ErrorBoundary
      fallback={
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  );
}
```

## Data Flow and Patterns

### Unidirectional Data Flow

Vibewell follows a strict unidirectional data flow:

1. State flows down from parent to child components via props
2. Events flow up from child to parent components via callbacks
3. Global state is accessed through hooks/context

### Container/Presenter Pattern

For complex features, we use the container/presenter pattern:

```tsx
// src/components/UserProfile/UserProfileContainer.tsx
import { useQuery } from 'react-query';
import UserProfilePresenter from './UserProfilePresenter';
import apiClient from '@/utils/api-client';

export function UserProfileContainer({ userId }) {
  const { 
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery(['user', userId], async () => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  });
  
  const updateProfile = async (userData) => {
    await apiClient.put(`/users/${userId}`, userData);
    refetch();
  };
  
  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile</div>;
  if (!user) return <div>User not found</div>;
  
  return (
    <UserProfilePresenter
      user={user}
      onUpdateProfile={updateProfile}
    />
  );
}

// src/components/UserProfile/UserProfilePresenter.tsx
export default function UserProfilePresenter({ user, onUpdateProfile }) {
  // Pure presentation component with no data fetching or state management
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <div className="profile-details">
        {/* Profile UI */}
      </div>
      {/* Edit profile form */}
    </div>
  );
}
```

## Related Guides

- [Form Validation Guide](./form-validation-guide.md)
- [API Documentation Guide](./api-documentation-guide.md)
- [Testing Guide](./testing-guide.md) 