'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Loading state configuration
 */
export interface LoadingConfig {
  /** ID for the loading operation */
  id: string;
  /** Message to display */
  message?: string;
  /** Progress value (0-100) */
  progress?: number;
  /** Whether the loading state can be cancelled */
  cancellable?: boolean;
  /** Whether to show a spinner */
  showSpinner?: boolean;
  /** Whether to block UI interaction */
  blockUI?: boolean;
  /** How long to delay showing the loading state (ms) */
  delayMs?: number;
  /** How long to keep the loading state visible after completion (ms) */
  minDurationMs?: number;
  /** Component to show instead of default loading state */
  customComponent?: React.ReactNode;
}

/**
 * Loading state information
 */
interface LoadingState extends LoadingConfig {
  /** When the loading started */
  startTime: number;
  /** Whether the loading state is active */
  isActive: boolean;
  /** Whether the loading state should be visible (after delay) */
  isVisible: boolean;
  /** Whether the loading state has been cancelled */
  isCancelled: boolean;
  /** Whether the loading state is complete */
  isComplete: boolean;
  /** Timer ID for the delay */
  delayTimerId?: NodeJS.Timeout;
  /** Timer ID for the minimum duration */
  minDurationTimerId?: NodeJS.Timeout;
}

/**
 * Loading state context interface
 */
interface LoadingStateContextType {
  /** All active loading states */
  loadingStates: Record<string, LoadingState>;
  /** Start a new loading state */
  startLoading: (config: LoadingConfig) => void;
  /** Update an existing loading state */
  updateLoading: (id: string, updates: Partial<LoadingConfig>) => void;
  /** End a loading state */
  endLoading: (id: string) => void;
  /** Cancel a loading state */
  cancelLoading: (id: string) => void;
  /** Check if a specific loading state is active */
  isLoading: (id?: string) => boolean;
  /** Get a specific loading state */
  getLoadingState: (id: string) => LoadingState | undefined;
  /** Whether any UI-blocking loading states are active */
  isUIBlocked: boolean;
  /** Get all active loading states as an array */
  activeLoadingStates: LoadingState[];
}

const LoadingStateContext = createContext<LoadingStateContextType | undefined>(undefined);

/**
 * Default loading configuration
 */
const defaultLoadingConfig: Partial<LoadingConfig> = {
  message: 'Loading...',
  progress: undefined,
  cancellable: false,
  showSpinner: true,
  blockUI: false,
  delayMs: 300, // Don't show for quick operations
  minDurationMs: 500, // Keep visible for at least this long
};

/**
 * Provider component for managing loading states throughout the application
 * 
 * @example
 * ```tsx
 * // In your app root
 * <LoadingStateProvider>
 *   <App />
 * </LoadingStateProvider>
 * 
 * // In a component
 * const { startLoading, endLoading, isLoading } = useLoadingState();
 * 
 * const handleSubmit = async () => {
 *   startLoading({ id: 'form-submit', message: 'Saving changes...' });
 *   try {
 *     await saveChanges();
 *   } finally {
 *     endLoading('form-submit');
 *   }
 * };
 * ```
 */
export const LoadingStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  // Clean up loading states that are complete and have been visible for their minimum duration
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setLoadingStates(prevStates => {
        const now = Date.now();
        const newStates = { ...prevStates };
        let hasChanges = false;

        Object.entries(newStates).forEach(([id, state]) => {
          // Remove if complete and min duration passed
          if (state.isComplete && now - state.startTime > (state.minDurationMs || 0)) {
            delete newStates[id];
            hasChanges = true;
          }
        });

        return hasChanges ? newStates : prevStates;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Start a new loading state
  const startLoading = useCallback((config: LoadingConfig) => {
    const { id, delayMs, ...restConfig } = config;
    const now = Date.now();

    // Create the initial loading state
    const initialState: LoadingState = {
      ...defaultLoadingConfig,
      ...restConfig,
      id,
      delayMs,
      startTime: now,
      isActive: true,
      isVisible: !delayMs || delayMs <= 0,
      isCancelled: false,
      isComplete: false,
    };

    setLoadingStates(prevStates => {
      // If this ID already exists, keep its timers
      const existingState = prevStates[id];
      const mergedState = { ...initialState };

      if (existingState) {
        // Clear existing timers
        if (existingState.delayTimerId) {
          clearTimeout(existingState.delayTimerId);
        }
        if (existingState.minDurationTimerId) {
          clearTimeout(existingState.minDurationTimerId);
        }
      }

      // Set up delay timer if needed
      if (delayMs && delayMs > 0) {
        mergedState.delayTimerId = setTimeout(() => {
          setLoadingStates(states => {
            if (!states[id] || states[id].isComplete) return states;
            return {
              ...states,
              [id]: { ...states[id], isVisible: true, delayTimerId: undefined }
            };
          });
        }, delayMs);
      }

      return {
        ...prevStates,
        [id]: mergedState
      };
    });
  }, []);

  // Update an existing loading state
  const updateLoading = useCallback((id: string, updates: Partial<LoadingConfig>) => {
    setLoadingStates(prevStates => {
      if (!prevStates[id]) return prevStates;

      return {
        ...prevStates,
        [id]: { ...prevStates[id], ...updates }
      };
    });
  }, []);

  // End a loading state
  const endLoading = useCallback((id: string) => {
    setLoadingStates(prevStates => {
      if (!prevStates[id]) return prevStates;

      const state = prevStates[id];
      const now = Date.now();
      const elapsed = now - state.startTime;
      const minDuration = state.minDurationMs || 0;

      // Check if we need to keep the state visible for minimum duration
      if (elapsed < minDuration) {
        const remainingTime = minDuration - elapsed;
        
        // Set a timer to complete after minimum duration
        const minDurationTimerId = setTimeout(() => {
          setLoadingStates(states => {
            if (!states[id]) return states;
            return {
              ...states,
              [id]: { 
                ...states[id], 
                isActive: false, 
                isComplete: true, 
                minDurationTimerId: undefined 
              }
            };
          });
        }, remainingTime);

        return {
          ...prevStates,
          [id]: { 
            ...state, 
            isActive: false, 
            minDurationTimerId 
          }
        };
      }

      // Otherwise, mark as complete immediately
      return {
        ...prevStates,
        [id]: { ...state, isActive: false, isComplete: true }
      };
    });
  }, []);

  // Cancel a loading state
  const cancelLoading = useCallback((id: string) => {
    setLoadingStates(prevStates => {
      if (!prevStates[id]) return prevStates;

      const state = prevStates[id];

      // Clear any timers
      if (state.delayTimerId) {
        clearTimeout(state.delayTimerId);
      }
      if (state.minDurationTimerId) {
        clearTimeout(state.minDurationTimerId);
      }

      return {
        ...prevStates,
        [id]: { 
          ...state, 
          isActive: false, 
          isCancelled: true, 
          isComplete: true,
          delayTimerId: undefined,
          minDurationTimerId: undefined
        }
      };
    });
  }, []);

  // Check if a specific loading state is active
  const isLoading = useCallback((id?: string) => {
    if (!id) {
      // Check if any loading states are active
      return Object.values(loadingStates).some(state => state.isActive);
    }
    return Boolean(loadingStates[id]?.isActive);
  }, [loadingStates]);

  // Get a specific loading state
  const getLoadingState = useCallback((id: string) => {
    return loadingStates[id];
  }, [loadingStates]);

  // Calculate whether UI is blocked by any loading state
  const isUIBlocked = useMemo(() => {
    return Object.values(loadingStates).some(
      state => state.isActive && state.isVisible && state.blockUI
    );
  }, [loadingStates]);

  // Get all active loading states as an array
  const activeLoadingStates = useMemo(() => {
    return Object.values(loadingStates)
      .filter(state => state.isActive && state.isVisible);
  }, [loadingStates]);

  const contextValue = useMemo(() => ({
    loadingStates,
    startLoading,
    updateLoading,
    endLoading,
    cancelLoading,
    isLoading,
    getLoadingState,
    isUIBlocked,
    activeLoadingStates
  }), [
    loadingStates, 
    startLoading, 
    updateLoading, 
    endLoading, 
    cancelLoading, 
    isLoading, 
    getLoadingState, 
    isUIBlocked, 
    activeLoadingStates
  ]);

  return (
    <LoadingStateContext.Provider value={contextValue}>
      {children}
      {isUIBlocked && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <LoadingOverlay activeLoadingStates={activeLoadingStates.filter(s => s.blockUI)} />
        </div>
      )}
      {!isUIBlocked && activeLoadingStates.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <LoadingToasts loadingStates={activeLoadingStates.filter(s => !s.blockUI)} />
        </div>
      )}
    </LoadingStateContext.Provider>
  );
};

/**
 * Hook to access the loading state context
 * 
 * @returns Loading state context
 * @throws Error if used outside of LoadingStateProvider
 */
export const useLoadingState = (): LoadingStateContextType => {
  const context = useContext(LoadingStateContext);
  if (!context) {
    throw new Error('useLoadingState must be used within a LoadingStateProvider');
  }
  return context;
};

/**
 * Loading overlay component
 */
const LoadingOverlay: React.FC<{ activeLoadingStates: LoadingState[] }> = ({ activeLoadingStates }) => {
  if (activeLoadingStates.length === 0) return null;

  // Show the first blocking loading state
  const state = activeLoadingStates[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
      {state.customComponent || (
        <div className="flex flex-col items-center">
          {state.showSpinner && (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          )}
          
          <h3 className="text-lg font-medium mb-2">{state.message}</h3>
          
          {state.progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
          )}
          
          {state.cancellable && (
            <button 
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => state.id && useLoadingState().cancelLoading(state.id)}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Loading toasts component
 */
const LoadingToasts: React.FC<{ loadingStates: LoadingState[] }> = ({ loadingStates }) => {
  return (
    <div className="flex flex-col space-y-2">
      {loadingStates.map(state => (
        <div 
          key={state.id}
          className="bg-white rounded-lg shadow-lg p-4 max-w-xs w-full flex items-center space-x-3 animate-slide-in"
        >
          {state.showSpinner && (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{state.message}</p>
            
            {state.progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${state.progress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {state.cancellable && (
            <button 
              className="p-1 text-gray-500 hover:text-gray-700"
              onClick={() => state.id && useLoadingState().cancelLoading(state.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default LoadingStateProvider; 