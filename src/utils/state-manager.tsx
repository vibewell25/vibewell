/**
 * Unified State Manager for Vibewell Platform
 * 
 * This module provides a unified API for state management that works with 
 * different state management libraries.
 * 
 * USAGE GUIDELINES:
 * 
 * 1. Zustand (DEFAULT): Use for most application state management needs:
 *    - Complex state with many fields
 *    - State that needs to be accessed across multiple components
 *    - Performance-sensitive features (AR, animations)
 *    - Global state that needs to be accessed outside of React components
 * 
 * 2. Context: Use only for:
 *    - Simple, local UI state
 *    - Theme/localization providers
 *    - State that is only shared between a parent and its immediate children
 *    - Components that don't need frequent updates
 * 
 * 3. Redux: Use only for:
 *    - Very complex state with interdependent slices
 *    - When you need Redux DevTools for debugging
 *    - When you need middleware for complex async flows
 *    - Legacy integrations that require Redux
 */
import * as React from 'react';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider as ReduxProvider } from 'react-redux';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { useStore as useZustandStore } from 'zustand';

// Enum for different types of state managers
export enum StateManagerType {
  CONTEXT = 'context',
  REDUX = 'redux',
  ZUSTAND = 'zustand'
}

// Base interface for all state managers
export interface StateManager<T> {
  getState(): T;
  setState(value: Partial<T>): void;
  resetState(): void;
  subscribe(listener: (state: T) => void): () => void;
}

// Function to create context-based state manager
export function createContextStateManager<T>(initialState: T): StateManager<T> & {
  Provider: React.FC<{ initialState?: T, children: React.ReactNode }>;
  useStateContext: () => readonly [T, React.Dispatch<React.SetStateAction<T>>];
} {
  // Create the context
  const StateContext = React.createContext<readonly [T, React.Dispatch<React.SetStateAction<T>>]>([
    initialState,
    () => initialState
  ]);

  // Provider component
  const StateProvider: React.FC<{ initialState?: T, children: React.ReactNode }> = ({ 
    initialState: propInitialState, 
    children 
  }) => {
    const [state, setState] = React.useState<T>(propInitialState || initialState);
    return React.createElement(
      StateContext.Provider,
      { value: [state, setState] },
      children
    );
  };

  // Hook to use this context
  const useStateContext = () => {
    const context = React.useContext(StateContext);
    if (!context) {
      throw new Error('useStateContext must be used within a StateProvider');
    }
    return context;
  };

  // Create a state manager instance
  const manager: StateManager<T> = {
    getState: () => {
      // In a component, you'd use the hook, but for the manager
      // we can only return the initial state since context requires components
      return initialState;
    },

    setState: (newState) => {
      // This is a placeholder - in actual components you'd use the hook and setState
      console.warn('setState outside of React component is not supported for context state');
      // Can't actually set state here because context state is bound to components
    },

    resetState: () => {
      // This is a placeholder
      console.warn('resetState outside of React component is not supported for context state');
    },

    subscribe: (listener) => {
      // Context doesn't support direct subscription outside components
      console.warn('subscribe outside of React component is not supported for context state');
      return () => {}; // Noop unsubscribe
    }
  };

  return {
    ...manager,
    Provider: StateProvider,
    useStateContext
  };
}

// Function to create Redux-based state manager
export function createReduxStateManager<T>(initialState: T): StateManager<T> & {
  Provider: React.FC<{ children: React.ReactNode }>;
  useReduxState: () => [T, ReturnType<typeof configureStore>['dispatch']];
} {
  // Create slice
  const stateSlice = createSlice({
    name: 'state',
    initialState,
    reducers: {
      setState: (state, action: PayloadAction<Partial<T>>) => {
        return { ...state, ...action.payload };
      },
      resetState: () => initialState
    }
  });

  // Extract actions
  const { setState, resetState } = stateSlice.actions;

  // Create store
  const store = configureStore({
    reducer: stateSlice.reducer
  });

  // Provider component
  const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return React.createElement(
      ReduxProvider,
      { store: store, children: children },
      null
    );
  };

  // Hook to use this Redux store
  const useReduxState = (): [T, typeof store.dispatch] => {
    const state = store.getState() as T;
    return [state, store.dispatch];
  };

  // Create a state manager instance
  const manager: StateManager<T> = {
    getState: () => store.getState() as T,

    setState: (newState) => {
      store.dispatch(setState(newState));
    },

    resetState: () => {
      store.dispatch(resetState());
    },

    subscribe: (listener) => {
      return store.subscribe(() => listener(store.getState() as T));
    }
  };

  return {
    ...manager,
    Provider: StateProvider,
    useReduxState
  };
}

// Function to create Zustand-based state manager
export function createZustandStateManager<T>(initialState: T): StateManager<T> & {
  useStore: UseBoundStore<StoreApi<T & {
    set: (fn: (state: T) => Partial<T>) => void;
    reset: () => void;
  }>>;
} {
  type StoreWithActions = T & {
    set: (fn: (state: T) => Partial<T>) => void;
    reset: () => void;
  };

  // Create Zustand store
  const useStoreHook = create<StoreWithActions>((set) => ({
    ...initialState,
    set: (fn) => set((state) => ({ ...state, ...fn(state) })),
    reset: () => set(initialState as unknown as StoreWithActions)
  }));

  // Create a state manager instance
  const manager: StateManager<T> = {
    getState: () => {
      const state = useStoreHook.getState();
      // Remove the actions from the state
      const { set, reset, ...pureState } = state;
      return pureState as T;
    },

    setState: (newState) => {
      useStoreHook.setState(newState as Partial<StoreWithActions>);
    },

    resetState: () => {
      useStoreHook.getState().reset();
    },

    subscribe: (listener) => {
      return useStoreHook.subscribe((state) => {
        const { set, reset, ...pureState } = state;
        listener(pureState as T);
      });
    }
  };

  return {
    ...manager,
    useStore: useStoreHook
  };
}

// Unified function to create state with any state management solution
export function createState<T>(
  initialState: T,
  type: StateManagerType = StateManagerType.ZUSTAND // Changed default to Zustand
): StateManager<T> {
  switch (type) {
    case StateManagerType.CONTEXT:
      return createContextStateManager<T>(initialState);
    case StateManagerType.REDUX:
      return createReduxStateManager<T>(initialState);
    case StateManagerType.ZUSTAND:
      return createZustandStateManager<T>(initialState);
    default:
      return createZustandStateManager<T>(initialState); // Default changed to Zustand
  }
}

// Create a selector hook that works with any state manager
export function createSelector<T, R>(
  selector: (state: T) => R,
  stateManager: StateManager<T>
): () => R {
  return () => selector(stateManager.getState());
} 