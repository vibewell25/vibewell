/**
 * Re-export of all state-manager functionality from state-manager.tsx
 * This file exists to maintain backward compatibility with imports from .ts
 */

// @ts-ignore - Ignore the .tsx extension
import * as StateManagerModule from './state-manager.tsx';

// Re-export everything
export default StateManagerModule;
export const {
  StateManagerType,
  createContextStateManager,
  createReduxStateManager,
  createZustandStateManager,
  createState,
  createSelector
} = StateManagerModule;

// Re-export the interface with a different name to avoid conflicts
// @ts-ignore - Ignore the .tsx extension
export type { StateManager } from './state-manager.tsx'; 