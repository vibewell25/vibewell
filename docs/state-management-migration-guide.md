# State Management Migration Guide

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