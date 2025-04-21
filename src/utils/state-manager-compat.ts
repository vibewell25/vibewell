/**
 * Re-export from state-manager-bridge.ts
 * This file exists to maintain backward compatibility with existing imports
 * This file has been renamed to state-manager-compat.ts to avoid build conflicts
 */

// Note: Do not rename this file as it would break existing imports
export * from './state-manager-bridge';
export { default } from './state-manager-bridge';
