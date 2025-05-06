/**
 * State Management Implementation
 * 
 * This module provides a unified interface for different state management approaches:
 * - Context API
 * - Redux
 * - Zustand
 * 
 * It serves as the primary state management implementation used by state-manager.ts.
 */

import { createContext, useContext, useState, useReducer, ReactNode } from 'react';
import { create as createZustand } from 'zustand';

// Supported state manager types
export enum StateManagerType {
  CONTEXT = 'context',
  REDUX = 'redux',
  ZUSTAND = 'zustand',
}

// Generic state manager interface
export interface StateManager<T> {
  getState: () => T;
  setState: (update: Partial<T> | ((prevState: T) => T)) => void;
  subscribe: (listener: (state: T) => void) => () => void;
}

// Create a state factory function
export function createState<T>(initialState: T): T {
  return initialState;
}

// Selector function type
export function createSelector<T, R>(selector: (state: T) => R): (state: T) => R {
  return selector;
}

// Context-based state manager implementation
// Note: This is a simplified version that would need to be expanded for actual use
export function createContextStateManager<T>(initialState: T): StateManager<T> {
  // Create a mock implementation that satisfies the interface
  return {
    getState: () => initialState,
    setState: () => {},
    subscribe: (listener) => {
      listener(initialState);
      return () => {};
    }
  };
}

// Redux-based state manager
export function createReduxStateManager<T>(initialState: T, reducer?: (state: T, action: any) => T): StateManager<T> {
  const defaultReducer = (state: T, action: any) => {
    if (action.type === 'SET_STATE') {
      if (typeof action.payload === 'function') {
        return action.payload(state);
      }
      return { ...state, ...action.payload };
    }
    return state;
  };
  
  const actualReducer = reducer || defaultReducer;
  let currentState = initialState;
  let listeners: ((state: T) => void)[] = [];
  
  const store = {
    getState: () => currentState,
    dispatch: (action: any) => {
      currentState = actualReducer(currentState, action);
      listeners.forEach(listener => listener(currentState));
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    }
  };
  
  return {
    getState: store.getState,
    setState: (update) => {
      store.dispatch({
        type: 'SET_STATE',
        payload: update
      });
    },
    subscribe: store.subscribe
  };
}

// Zustand-based state manager
export function createZustandStateManager<T>(initialState: T): StateManager<T> {
  const useStore = createZustand<T & { set: (fn: Partial<T> | ((state: T) => T)) => void }>((set) => ({
    ...initialState,
    set: (update) => set(state => {
      if (typeof update === 'function') {
        return { ...state, ...(update(state) as any) };
      }
      return { ...state, ...update };
    })
  }));
  
  return {
    getState: () => {
      const state = useStore.getState();
      const { set, ...rest } = state;
      return rest as T;
    },
    setState: (update) => useStore.getState().set(update),
    subscribe: (listener) => useStore.subscribe(state => {
      const { set, ...rest } = state;
      listener(rest as T);
    })
  };
} 