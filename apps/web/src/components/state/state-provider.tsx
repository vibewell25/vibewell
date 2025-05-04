import React, { useReducer, useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { Store } from '@reduxjs/toolkit';

/**
 * Context Provider component for context-based state management
 */
export interface ContextProviderProps<T> {
  initialState: T;
  children: React.ReactNode;
  stateContext: React.Context<[T, React.Dispatch<React.SetStateAction<T>>] | undefined>;
  onStateChange?: (newState: T, prevState: T) => void;
}

export function ContextProvider<T>({
  initialState,
  children,
  stateContext,
  onStateChange,
}: ContextProviderProps<T>) {
  // State using useReducer for immutability
  const [state, dispatch] = useReducer(
    (state: T, action: Partial<T> | ((state: T) => Partial<T>)) => {
      const newState =
        typeof action === 'function' ? { ...state, ...action(state) } : { ...state, ...action };

      // Call the state change handler if provided
      if (onStateChange) {
        onStateChange(newState, state);
      }

      return newState;
    },
    initialState,
  );

  // Memoize context value
  const contextValue = useMemo(() => [state, dispatch] as const, [state]);

  return <stateContext.Provider value={contextValue}>{children}</stateContext.Provider>;
}

/**
 * Redux Provider component wrapper for Redux-based state management
 */
export interface ReduxProviderProps {
  store: Store;
  children: React.ReactNode;
}

export function StateReduxProvider({ store, children }: ReduxProviderProps) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}

/**
 * Auth Provider component for tests and development
 */
export interface AuthProviderProps {
  user?: any;
  children: React.ReactNode;
}

export function MockAuthProvider({
  user = { id: 'test-user-id', name: 'Test User' },
  children,
}: AuthProviderProps) {
  return (
    <div data-testid="mock-auth-provider" data-user={JSON.stringify(user)}>
      {children}
    </div>
  );
}
