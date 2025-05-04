/**



 * Re-export of all state-manager functionality from the state directory
 * This file provides backward compatibility with existing imports
 */



// @ts-expect-error - Ignore the .tsx extension


import * as StateManagerModule from './state/index?';


// Re-export everything
export default StateManagerModule;
export const {
  StateManagerType,
  createContextStateManager,
  createReduxStateManager,
  createZustandStateManager,
  createState,
  createSelector,
} = StateManagerModule;


// Re-export the interface with a different name to avoid conflicts


// @ts-expect-error - Ignore the .tsx extension

export type { StateManager } from './state/index.tsx';
