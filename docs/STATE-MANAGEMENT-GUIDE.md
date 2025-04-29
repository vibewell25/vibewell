# Vibewell State Management Guide

This document provides a comprehensive overview of the state management patterns and decisions used in the Vibewell application.

## Table of Contents

1. [State Management Approach](#state-management-approach)
2. [Unified State Manager](#unified-state-manager)
3. [When to Use Each Pattern](#when-to-use-each-pattern)
4. [Context API Usage](#context-api-usage)
5. [Redux Usage](#redux-usage)
6. [Zustand Usage](#zustand-usage)
7. [Local Component State](#local-component-state)
8. [Managing Form State](#managing-form-state)
9. [State Management for Beauty and Wellness Features](#state-management-for-beauty-and-wellness-features)
10. [Testing State Management](#testing-state-management)
11. [Best Practices and Guidelines](#best-practices-and-guidelines)

## State Management Approach

Vibewell employs a hybrid state management approach with a unified API that supports multiple state management solutions, allowing different parts of the application to use the most appropriate pattern while maintaining a consistent interface.

### Key Principles

- **Single Source of Truth**: Data should have a single, authoritative source
- **Predictable State Updates**: State changes should be explicit and traceable
- **Minimize Prop Drilling**: Use appropriate state management to avoid excessive prop passing
- **Performance Optimization**: Choose state solutions based on update frequency and scope
- **Testability**: All state management should be easily testable

## Unified State Manager

The `src/utils/state-manager.tsx` provides a unified API that supports three different state management patterns:

- **React Context API**: For simpler state that doesn't change frequently
- **Redux**: For complex global state with many consumers or frequent updates
- **Zustand**: For state that requires both simplicity and performance

### Basic Usage

```tsx
// Create state with any of the supported state managers
import { createState, StateManagerType } from '@/utils/state-manager';

// Define your state type
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Create the state with initial values
const counterState = createState<CounterState>(
  {
    count: 0,
    increment: () => counterState.setState(state => ({ count: state.count + 1 })),
    decrement: () => counterState.setState(state => ({ count: state.count - 1 })),
  },
  StateManagerType.CONTEXT // or REDUX or ZUSTAND
);

// Use in components
function Counter() {
  const [state, setState] = counterState.useStateContext();
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={state.increment}>Increment</button>
      <button onClick={state.decrement}>Decrement</button>
    </div>
  );
}
```

## When to Use Each Pattern

### Use Context API When:

- The state is relatively simple
- Updates are infrequent
- The state is only used by a small part of your component tree
- You need React's built-in context features
- Example: Theme settings, user preferences

### Use Redux When:

- You have complex state with many parts that interact
- Many components need to access the state
- You need powerful middleware for side effects (redux-saga, redux-thunk)
- You want time-travel debugging and robust dev tools
- Example: Shopping cart, multi-step booking flow

### Use Zustand When:

- You want the simplicity of Context but with better performance
- You need a middle ground between Context and Redux
- Your state has frequent updates that would cause performance issues with Context
- Example: Real-time notifications, chat/messaging features

## Context API Usage

For Context-based state management:

```tsx
import { createContextStateManager } from '@/utils/state-manager';

interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const initialState: UserPreferences = {
  theme: 'light',
  fontSize: 'medium',
  setTheme: () => {}, // Will be implemented after creation
  setFontSize: () => {}, // Will be implemented after creation
};

const preferencesManager = createContextStateManager<UserPreferences>(initialState);

// Implement the methods
preferencesManager.setState(state => ({
  ...state,
  setTheme: (theme) => preferencesManager.setState({ theme }),
  setFontSize: (fontSize) => preferencesManager.setState({ fontSize }),
}));

// Usage in components
function App() {
  return (
    <preferencesManager.Provider>
      <YourComponent />
    </preferencesManager.Provider>
  );
}

function YourComponent() {
  const [preferences] = preferencesManager.useStateContext();
  
  return (
    <div>
      <p>Current theme: {preferences.theme}</p>
      <button onClick={() => preferences.setTheme('dark')}>
        Switch to Dark Mode
      </button>
    </div>
  );
}
```

## Redux Usage

For Redux-based state management:

```tsx
import { createReduxStateManager } from '@/utils/state-manager';

interface BookingState {
  services: Service[];
  selectedService: Service | null;
  date: string | null;
  time: string | null;
  selectService: (service: Service) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  services: [],
  selectedService: null,
  date: null,
  time: null,
  selectService: () => {}, // Will be implemented after creation
  setDate: () => {}, // Will be implemented after creation
  setTime: () => {}, // Will be implemented after creation
  resetBooking: () => {}, // Will be implemented after creation
};

const bookingManager = createReduxStateManager<BookingState>(initialState);

// Implement methods
bookingManager.setState(state => ({
  ...state,
  selectService: (service) => bookingManager.setState({ selectedService: service }),
  setDate: (date) => bookingManager.setState({ date }),
  setTime: (time) => bookingManager.setState({ time }),
  resetBooking: () => bookingManager.resetState(),
}));

// Usage in components
function BookingApp() {
  return (
    <bookingManager.Provider>
      <BookingForm />
    </bookingManager.Provider>
  );
}

function BookingForm() {
  const [booking, dispatch] = bookingManager.useReduxState();
  
  return (
    <div>
      <h2>Book Your Service</h2>
      <div>
        {booking.services.map(service => (
          <button 
            key={service.id}
            onClick={() => booking.selectService(service)}
          >
            {service.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Zustand Usage

For Zustand-based state management:

```tsx
import { createZustandStateManager } from '@/utils/state-manager';

interface ChatState {
  messages: Message[];
  sendMessage: (text: string) => void;
  deleteMessage: (id: string) => void;
  markAsRead: (id: string) => void;
}

const initialState: ChatState = {
  messages: [],
  sendMessage: () => {}, // Will be implemented after creation
  deleteMessage: () => {}, // Will be implemented after creation
  markAsRead: () => {}, // Will be implemented after creation
};

const chatManager = createZustandStateManager<ChatState>(initialState);

// Implement methods
chatManager.setState(state => ({
  ...state,
  sendMessage: (text) => {
    const newMessage = {
      id: Math.random().toString(),
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    chatManager.setState(state => ({
      messages: [...state.messages, newMessage]
    }));
  },
  deleteMessage: (id) => {
    chatManager.setState(state => ({
      messages: state.messages.filter(msg => msg.id !== id)
    }));
  },
  markAsRead: (id) => {
    chatManager.setState(state => ({
      messages: state.messages.map(msg => 
        msg.id === id ? { ...msg, read: true } : msg
      )
    }));
  },
}));

// Usage in components
function ChatComponent() {
  const { messages, sendMessage, deleteMessage } = chatManager.useStore();
  
  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <p>{msg.text}</p>
            <button onClick={() => deleteMessage(msg.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Local Component State

Not all state needs to be managed by a state manager. Local component state using React's `useState` and `useReducer` hooks is appropriate for:

- Form input values
- UI state like open/closed modals
- Component-specific data that doesn't need to be shared

### Example: Local Component State

```tsx
function BeautyProductCard({ product }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      
      {isExpanded && (
        <div className="product-details">
          <p>{product.description}</p>
          
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Managing Form State

For forms, we recommend using `react-hook-form` for performance and simplicity:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const beautyAppointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  service: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BeautyAppointmentForm = z.infer<typeof beautyAppointmentSchema>;

function BeautyAppointmentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<BeautyAppointmentForm>({
    resolver: zodResolver(beautyAppointmentSchema),
  });
  
  const onSubmit = (data: BeautyAppointmentForm) => {
    // Submit appointment
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      
      {/* Other fields... */}
      
      <button type="submit">Book Appointment</button>
    </form>
  );
}
```

## State Management for Beauty and Wellness Features

### Beauty Product Try-On

For virtual try-on features, we use Zustand due to its performance with real-time updates:

```tsx
import { createZustandStateManager } from '@/utils/state-manager';

interface TryOnState {
  currentProduct: BeautyProduct | null;
  cameraActive: boolean;
  filterApplied: boolean;
  setProduct: (product: BeautyProduct | null) => void;
  toggleCamera: () => void;
  applyFilter: (apply: boolean) => void;
}

const tryOnManager = createZustandStateManager<TryOnState>({
  currentProduct: null,
  cameraActive: false,
  filterApplied: false,
  setProduct: () => {},
  toggleCamera: () => {},
  applyFilter: () => {},
});

// Implement methods
tryOnManager.setState(state => ({
  ...state,
  setProduct: (product) => tryOnManager.setState({ currentProduct: product }),
  toggleCamera: () => tryOnManager.setState(state => ({ cameraActive: !state.cameraActive })),
  applyFilter: (apply) => tryOnManager.setState({ filterApplied: apply }),
}));
```

### Wellness Booking

For booking wellness services, we use Redux for the complex multi-step flow:

```tsx
import { createReduxStateManager } from '@/utils/state-manager';

interface WellnessBookingState {
  steps: string[];
  currentStep: number;
  selectedService: WellnessService | null;
  selectedProvider: Provider | null;
  selectedDate: string | null;
  selectedTime: string | null;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  selectService: (service: WellnessService) => void;
  selectProvider: (provider: Provider) => void;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  resetBooking: () => void;
}

const wellnessBookingManager = createReduxStateManager<WellnessBookingState>({
  // Initial state and methods...
});
```

## Testing State Management

All state management solutions should be thoroughly tested:

### Testing Context-based State

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { createContextStateManager } from '@/utils/state-manager';

test('context state manager updates state correctly', () => {
  // Create a test state manager
  const counterState = createContextStateManager({ count: 0 });
  
  // Create a wrapper with the provider
  const wrapper = ({ children }) => (
    <counterState.Provider>{children}</counterState.Provider>
  );
  
  // Render the hook with the provider wrapper
  const { result } = renderHook(() => counterState.useStateContext(), { wrapper });
  
  // Initial state check
  expect(result.current[0].count).toBe(0);
  
  // Update state
  act(() => {
    result.current[1]({ count: 5 });
  });
  
  // Verify state updated
  expect(result.current[0].count).toBe(5);
});
```

### Testing Redux-based State

```tsx
import { createReduxStateManager } from '@/utils/state-manager';

test('redux state manager updates state correctly', () => {
  const counterState = createReduxStateManager({ count: 0 });
  
  // Get initial state
  expect(counterState.getState().count).toBe(0);
  
  // Update state
  counterState.setState({ count: 5 });
  
  // Verify state updated
  expect(counterState.getState().count).toBe(5);
  
  // Test subscription
  let subscriptionCalled = false;
  const unsubscribe = counterState.subscribe(state => {
    subscriptionCalled = true;
    expect(state.count).toBe(10);
  });
  
  counterState.setState({ count: 10 });
  expect(subscriptionCalled).toBe(true);
  
  // Test unsubscribe
  subscriptionCalled = false;
  unsubscribe();
  counterState.setState({ count: 15 });
  expect(subscriptionCalled).toBe(false);
});
```

### Testing Zustand-based State

```tsx
import { createZustandStateManager } from '@/utils/state-manager';

test('zustand state manager updates state correctly', () => {
  const counterState = createZustandStateManager({ count: 0 });
  
  // Get initial state
  expect(counterState.getState().count).toBe(0);
  
  // Update state
  counterState.setState({ count: 5 });
  
  // Verify state updated
  expect(counterState.getState().count).toBe(5);
});
```

## Best Practices and Guidelines

1. **Choose the Right Tool**: Select the state management approach based on the specific needs of each feature
   
2. **Minimize State**: Only store what you need in state, derive the rest
   
3. **Colocation**: Keep state as close as possible to where it's used
   
4. **Immutability**: Always update state immutably
   
5. **Normalize Data**: For complex relational data, normalize the structure
   
6. **Separate UI from Business Logic**: Keep UI state separate from business data
   
7. **Use Selectors**: Create selectors for computing derived state
   
8. **Document State Shape**: Include TypeScript interfaces for all state
   
9. **Test Thoroughly**: Write tests for all state interactions
   
10. **Performance Monitoring**: Monitor re-renders and state update performance

Remember that the unified state manager is designed to make it easier to switch between different state management approaches as your application evolves, so don't be afraid to refactor if performance or maintenance issues arise. # State Management Migration Guide

This document provides guidance on migrating existing state management code to follow our consolidated state management approach.

## Overview of Changes

We have consolidated our state management approach to prioritize consistency and performance:

1. **Zustand as Default**: Zustand is now the preferred state management solution for most use cases.
2. **Context API Limited Usage**: Context API should only be used for simple UI state shared between closely related components.
3. **Redux for Specific Use Cases**: Redux should only be used for complex, interconnected state with middleware requirements.

## When to Use Each Solution

### Use Zustand For:
- Global application state
- Features that need state access outside of React components
- Performance-sensitive features (AR, animations, real-time updates)
- Most data fetching and caching requirements
- User preferences and session state

### Use Context API For:
- Theme providers
- Localization/i18n providers
- Simple UI state shared between parent and immediate children
- Form state within a single form component tree
- Components that don't need frequent updates

### Use Redux For:
- Legacy code that already uses Redux extensively
- Very complex state with many interdependent slices
- When Redux DevTools is required for debugging complex state
- When you need specific Redux middleware for complex async flows

## Migration Steps

### Step 1: Identify Current State Usage

Before migrating, identify how your component is currently using state:

```bash
# Find all state manager usages in your component or feature
grep -r "createState\|useReduxState\|useStateContext\|useStore" ./src/components/your-component
```

### Step 2: Evaluate State Requirements

Ask these questions:
- Is this state shared across multiple components?
- Does it need to be accessed outside of React components?
- Does it require frequent updates?
- Is it performance-sensitive?

### Step 3: Migrate to the Appropriate Solution

#### Migrating from Context to Zustand:

```typescript
// OLD APPROACH
const myState = createState<MyStateType>(initialState, StateManagerType.CONTEXT);

// NEW APPROACH
const myState = createState<MyStateType>(initialState); // Uses Zustand by default
```

Usage changes:
```typescript
// OLD APPROACH (CONTEXT)
const MyComponent = () => {
  const [state, setState] = myState.useStateContext();
  
  return <div>{state.value}</div>;
};

// NEW APPROACH (ZUSTAND)
const MyComponent = () => {
  const value = myState.useStore(state => state.value);
  const setValue = React.useCallback((newValue) => {
    myState.setState({ value: newValue });
  }, []);
  
  return <div>{value}</div>;
};
```

#### Migrating from Redux to Zustand:

```typescript
// OLD APPROACH
const myState = createState<MyStateType>(initialState, StateManagerType.REDUX);

// NEW APPROACH
const myState = createState<MyStateType>(initialState); // Uses Zustand by default
```

Usage changes:
```typescript
// OLD APPROACH (REDUX)
const MyComponent = () => {
  const [state, dispatch] = myState.useReduxState();
  
  return <div>{state.value}</div>;
};

// NEW APPROACH (ZUSTAND)
const MyComponent = () => {
  const value = myState.useStore(state => state.value);
  
  return <div>{value}</div>;
};
```

### Step 4: Update Providers

Ensure your app is set up with the correct providers:

```tsx
// src/app/providers.tsx
import { beautyCatalogState, virtualTryOnState, bookingState } from '../utils/beauty-state';

export function Providers({ children }) {
  return (
    <beautyCatalogState.Provider>
      <virtualTryOnState.Provider>
        <bookingState.Provider>
          {children}
        </bookingState.Provider>
      </virtualTryOnState.Provider>
    </beautyCatalogState.Provider>
  );
}
```

## Example: Beauty Catalog State

The beauty catalog state has been migrated to use Zustand by default:

```typescript
// Before
const catalogState = createState<BeautyCatalogState>(
  initialCatalogState,
  StateManagerType.ZUSTAND // Explicitly specified Zustand
);

// After
const catalogState = createState<BeautyCatalogState>(
  initialCatalogState
  // No need to specify StateManagerType.ZUSTAND as it's now the default
);
```

## Best Practices

1. **Prefer Selectors**: Use selectors to access only the parts of state you need
   ```typescript
   // Good
   const productName = state.useStore(state => state.selectedProduct?.name);
   
   // Avoid - rerenders on any state change
   const state = myState.useStore();
   const productName = state.selectedProduct?.name;
   ```

2. **Keep States Focused**: Each state manager should handle a specific domain
   ```typescript
   // Good
   const userState = createState<UserState>(initialUserState);
   const cartState = createState<CartState>(initialCartState);
   
   // Avoid
   const appState = createState<AppState>(initialAppState); // Too broad
   ```

3. **Use Actions**: Encapsulate state changes in actions
   ```typescript
   myState.setState(state => ({
     ...state,
     addToCart: (product) => {
       const currentItems = myState.getState().cartItems;
       myState.setState({ 
         cartItems: [...currentItems, product] 
       });
     }
   }));
   ```

## Testing

When testing components that use Zustand state, mock the state manager:

```typescript
// __mocks__/beauty-state.ts
export const mockCatalogState = {
  products: [/* mock products */],
  isLoading: false,
  error: null,
  // ...other state properties
  fetchProducts: jest.fn(),
  setFilter: jest.fn(),
  // ...other actions
};

export const createBeautyCatalogState = jest.fn(() => ({
  getState: () => mockCatalogState,
  setState: jest.fn(),
  resetState: jest.fn(),
  subscribe: jest.fn(),
  useStore: jest.fn().mockImplementation(selector => 
    selector ? selector(mockCatalogState) : mockCatalogState
  )
}));

// In your tests
jest.mock('../utils/beauty-state');
import { createBeautyCatalogState, mockCatalogState } from '../utils/beauty-state';

test('component renders products', () => {
  // Test with mocked state
  render(<ProductList />);
  expect(screen.getByText(mockCatalogState.products[0].name)).toBeInTheDocument();
});
```

## Timeline

- **Phase 1**: Migrate performance-sensitive features (AR, animations) to Zustand
- **Phase 2**: Migrate global application state to Zustand
- **Phase 3**: Evaluate remaining Redux usage and migrate where appropriate
- **Phase 4**: Ensure Context API is only used for simple UI state 