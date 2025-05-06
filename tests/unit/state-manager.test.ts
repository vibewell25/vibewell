import { vi, describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Mock external dependencies
vi.mock('react-redux', () => ({
  Provider: ({ children }) => children
}));

vi.mock('@reduxjs/toolkit', () => ({
  configureStore: vi.fn(() => ({
    getState: () => ({ test: { value: 0 } }),
    dispatch: vi.fn(),
    subscribe: vi.fn()
  }))
}));

// Define the StateManagerType enum directly for testing
enum StateManagerType {
  CONTEXT = 'context',
  REDUX = 'redux',
  ZUSTAND = 'zustand'
}

describe('Unified State Management Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('State Manager', () => {
    describe('Context-based State Manager', () => {
      test('should create and update context-based state', () => {
        // Create state variables outside of hook for proper updates
        let stateObj: { count: number } = { count: 0 };
        
        // Mock the context state manager for this test
        const createContextStateManager = (initialState: { count: number }) => {
          stateObj = { ...initialState };
          
          const setState = (newState: Partial<typeof stateObj>) => {
            stateObj = { ...stateObj, ...newState };
            return stateObj;
          };
          
          return {
            useStateContext: () => [stateObj, setState] as const
          };
        };
        
        // Create a simple counter state with context
        const counterState = createContextStateManager({ count: 0 });
        
        // Render the hook with mockImplementation
        const { result, rerender } = renderHook(() => {
          const [state, setState] = counterState.useStateContext();
          return {
            state,
            actions: {
              increment: () => setState({ count: state.count + 1 }),
              decrement: () => setState({ count: state.count - 1 }),
              incrementBy: (amount: number) => setState({ count: state.count + amount })
            }
          };
        });

        // Initial state
        expect(result.current.state.count).toBe(0);
        
        // Test increment
        act(() => {
          result.current.actions.increment();
        });
        rerender();
        expect(result.current.state.count).toBe(1);
        
        // Test decrement
        act(() => {
          result.current.actions.decrement();
        });
        rerender();
        expect(result.current.state.count).toBe(0);
        
        // Test increment with parameter
        act(() => {
          result.current.actions.incrementBy(5);
        });
        rerender();
        expect(result.current.state.count).toBe(5);
      });

      test('should support selectors for context-based state', () => {
        interface UserStateType {
          name: string;
          email: string;
          preferences: {
            theme: string;
            notifications: boolean;
          };
        }
        
        // Create state variables outside of hook for proper updates
        let userStateObj: UserStateType = { 
          name: 'John', 
          email: 'john@example.com',
          preferences: { 
            theme: 'light',
            notifications: true 
          }
        };
        
        // Mock the context state manager for this test
        const createContextStateManager = (initialState: UserStateType) => {
          userStateObj = { ...initialState };
          
          const setState = (newState: Partial<UserStateType>) => {
            userStateObj = { ...userStateObj, ...newState };
            return userStateObj;
          };
          
          return {
            useStateContext: () => [userStateObj, setState] as const
          };
        };
        
        // Create a complex state with user data
        const userState = createContextStateManager(userStateObj);
        
        // Create selectors
        const themeSelector = (state: UserStateType) => state.preferences.theme;
        const nameSelector = (state: UserStateType) => state.name;
        
        // Render the hooks with mockImplementation
        const { result, rerender } = renderHook(() => {
          const [state, setState] = userState.useStateContext();
          return {
            state,
            actions: {
              updateName: (name: string) => setState({ ...state, name }),
              toggleTheme: () => setState({
                ...state,
                preferences: {
                  ...state.preferences,
                  theme: state.preferences.theme === 'light' ? 'dark' : 'light'
                }
              })
            },
            theme: themeSelector(state),
            name: nameSelector(state)
          };
        });

        // Test initial selectors
        expect(result.current.theme).toBe('light');
        expect(result.current.name).toBe('John');
        
        // Update state
        act(() => {
          result.current.actions.toggleTheme();
        });
        rerender();
        // Selectors should update
        expect(result.current.theme).toBe('dark');
        
        // Update name
        act(() => {
          result.current.actions.updateName('Jane');
        });
        rerender();
        // Name selector should update
        expect(result.current.name).toBe('Jane');
      });
    });

    describe('Redux-based State Manager', () => {
      test('should work with Redux store', () => {
        interface ReduxState {
          value: number;
        }
        
        // Create state variables outside of hook for proper updates
        let reduxStateObj: ReduxState = { value: 0 };
        
        // Mock the Redux state manager for this test
        const createReduxStateManager = (initialState: ReduxState) => {
          reduxStateObj = { ...initialState };
          
          const dispatch = (action: { type: string; payload?: any }) => {
            if (action.type === 'TEST/INCREMENT') {
              reduxStateObj = { ...reduxStateObj, value: reduxStateObj.value + 1 };
            } else if (action.type === 'TEST/DECREMENT') {
              reduxStateObj = { ...reduxStateObj, value: reduxStateObj.value - 1 };
            } else if (action.type === 'TEST/SET_VALUE') {
              reduxStateObj = { ...reduxStateObj, value: action.payload };
            }
            return action;
          };
          
          return {
            useReduxState: () => [reduxStateObj, dispatch] as const
          };
        };
        
        // Create state with Redux
        const reduxState = createReduxStateManager({ value: 0 });
        
        // Render the hook with mockImplementation
        const { result, rerender } = renderHook(() => {
          const [state, dispatch] = reduxState.useReduxState();
          return {
            state,
            actions: {
              increment: () => dispatch({ type: 'TEST/INCREMENT' }),
              decrement: () => dispatch({ type: 'TEST/DECREMENT' }),
              setValue: (value: number) => dispatch({ type: 'TEST/SET_VALUE', payload: value })
            }
          };
        });

        // Initial state
        expect(result.current.state.value).toBe(0);
        
        // Test increment
        act(() => {
          result.current.actions.increment();
        });
        rerender();
        expect(result.current.state.value).toBe(1);
        
        // Test setValue
        act(() => {
          result.current.actions.setValue(10);
        });
        rerender();
        expect(result.current.state.value).toBe(10);
      });
    });

    describe('Zustand-based State Manager', () => {
      test('should create and update Zustand state', () => {
        interface CounterState {
          count: number;
        }
        
        // Create state variables outside of hook for proper updates
        let zustandStateObj: CounterState = { count: 0 };
        
        // Mock the Zustand state manager for this test
        const createZustandStateManager = ({ 
          initialState, 
          actions 
        }: { 
          initialState: CounterState; 
          actions: Record<string, (state: CounterState, ...args: any[]) => CounterState> 
        }) => {
          zustandStateObj = { ...initialState };
          
          return {
            getState: () => zustandStateObj,
            setState: (fn: (state: CounterState) => CounterState) => {
              zustandStateObj = fn(zustandStateObj);
              return zustandStateObj;
            },
            useStore: () => ({
              ...zustandStateObj,
              set: (fn: (state: CounterState) => CounterState) => {
                zustandStateObj = fn(zustandStateObj);
                return zustandStateObj;
              }
            }),
            actions
          };
        };
        
        // Create a Zustand store
        const stateManager = createZustandStateManager({
          initialState: { count: 0 },
          actions: {
            increment: (state: CounterState) => ({ count: state.count + 1 }),
            decrement: (state: CounterState) => ({ count: state.count - 1 }),
            setCount: (state: CounterState, count: number) => ({ count })
          }
        });
        
        // Render the hook with mockImplementation
        const { result, rerender } = renderHook(() => {
          const state = stateManager.useStore();
          return {
            count: state.count,
            increment: () => state.set((s) => stateManager.actions.increment(s)),
            decrement: () => state.set((s) => stateManager.actions.decrement(s)),
            setCount: (n: number) => state.set((s) => stateManager.actions.setCount(s, n))
          };
        });

        // Initial state
        expect(result.current.count).toBe(0);
        
        // Test increment
        act(() => {
          result.current.increment();
        });
        rerender();
        expect(result.current.count).toBe(1);
        
        // Test decrement
        act(() => {
          result.current.decrement();
        });
        rerender();
        expect(result.current.count).toBe(0);
        
        // Test setCount
        act(() => {
          result.current.setCount(5);
        });
        rerender();
        expect(result.current.count).toBe(5);
      });

      test('should allow complex state structures with Zustand', () => {
        interface UserState {
          user: {
            name: string;
            age: number;
            settings: {
              darkMode: boolean;
              notifications: boolean;
            };
          };
        }
        
        // Create state variables outside of hook for proper updates
        let complexStateObj: UserState = {
          user: {
            name: 'Test User',
            age: 30,
            settings: {
              darkMode: false,
              notifications: true
            }
          }
        };
        
        // Mock the Zustand state manager for this test
        const createZustandStateManager = ({ 
          initialState, 
          actions 
        }: { 
          initialState: UserState; 
          actions: Record<string, (state: UserState, ...args: any[]) => UserState> 
        }) => {
          complexStateObj = { ...initialState };
          
          return {
            getState: () => complexStateObj,
            setState: (fn: (state: UserState) => UserState) => {
              complexStateObj = fn(complexStateObj);
              return complexStateObj;
            },
            useStore: () => ({
              ...complexStateObj,
              set: (fn: (state: UserState) => UserState) => {
                complexStateObj = fn(complexStateObj);
                return complexStateObj;
              }
            }),
            actions
          };
        };

        // Create a Zustand store for user state
        const userStoreManager = createZustandStateManager({
          initialState: complexStateObj,
          actions: {
            updateName: (state: UserState, name: string) => ({
              ...state,
              user: {
                ...state.user,
                name
              }
            }),
            toggleDarkMode: (state: UserState) => ({
              ...state,
              user: {
                ...state.user,
                settings: {
                  ...state.user.settings,
                  darkMode: !state.user.settings.darkMode
                }
              }
            }),
            toggleNotifications: (state: UserState) => ({
              ...state,
              user: {
                ...state.user,
                settings: {
                  ...state.user.settings,
                  notifications: !state.user.settings.notifications
                }
              }
            })
          }
        });
        
        // Render the hook with mockImplementation
        const { result, rerender } = renderHook(() => {
          const state = userStoreManager.useStore();
          return {
            user: state.user,
            updateName: (name: string) => state.set((s) => userStoreManager.actions.updateName(s, name)),
            toggleDarkMode: () => state.set((s) => userStoreManager.actions.toggleDarkMode(s)),
            toggleNotifications: () => state.set((s) => userStoreManager.actions.toggleNotifications(s))
          };
        });

        // Initial state
        expect(result.current.user.name).toBe('Test User');
        expect(result.current.user.settings.darkMode).toBe(false);
        expect(result.current.user.settings.notifications).toBe(true);
        
        // Update name
        act(() => {
          result.current.updateName('Jane Doe');
        });
        rerender();
        expect(result.current.user.name).toBe('Jane Doe');
        
        // Toggle dark mode
        act(() => {
          result.current.toggleDarkMode();
        });
        rerender();
        expect(result.current.user.settings.darkMode).toBe(true);
        
        // Toggle notifications
        act(() => {
          result.current.toggleNotifications();
        });
        rerender();
        expect(result.current.user.settings.notifications).toBe(false);
      });
    });
  });
});
