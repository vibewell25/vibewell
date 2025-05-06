/**
 * State Manager Bridge
 * 
 * This file forwards all exports from the main state management implementation.
 * It exists for backward compatibility with existing imports.
 * 
 * All new code should import directly from the main implementation at:
 * @/utils/state
 */

import {
  StateManagerType,
  createContextStateManager,
  createReduxStateManager,
  createZustandStateManager,
  createState,
  createSelector,
} from '@/utils/state';

export {
  StateManagerType,
  createContextStateManager,
  createReduxStateManager,
  createZustandStateManager,
  createState,
  createSelector,
};

// Re-export types
export type { StateManager } from '@/utils/state';

// For backward compatibility with code using the old type name
export type StateUpdater<T> = (prevState: T) => T;
export type ZustandStore<T> = T & {
  set: (update: Partial<T> | StateUpdater<T>) => void;
}; 