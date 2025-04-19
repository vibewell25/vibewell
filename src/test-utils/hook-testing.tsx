/**
 * Utilities for testing React hooks
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

// Type for options that might be passed to renderHook
type RenderHookOptions = {
  providers?: React.ComponentType<{ children?: React.ReactNode }>[];
  [key: string]: unknown;
};

/**
 * Create a wrapper component for testing hooks with context providers
 * @param {React.ComponentType<{ children?: React.ReactNode }>} providers - Array of context providers to wrap the hook with
 * @returns {React.FC} - Wrapper component
 */
export function createWrapperWithProviders(providers: React.ComponentType<{ children?: React.ReactNode }>[] = []): React.FC<{ children?: React.ReactNode }> {
  return ({ children }) => {
    return providers.reduceRight((acc, Provider) => {
      return <Provider>{acc}</Provider>;
    }, children);
  };
}

/**
 * Render a hook with the specified providers
 * @param {Function} hook - The hook to render
 * @param {Object} options - The options to pass to renderHook
 * @param {React.ComponentType<{ children?: React.ReactNode }>[]} options.providers - Array of context providers
 * @returns {Object} - The result of renderHook
 */
export function renderHookWithProviders<T>(hook: () => T, { providers = [], ...options }: RenderHookOptions = {}) {
  const wrapper = createWrapperWithProviders(providers);
  return renderHook(hook, { wrapper, ...options });
}

/**
 * Wait for an async event to complete
 * @param {Function} callback - Callback to run after waiting
 * @returns {Promise<void>}
 */
export async function waitForAsyncEvents(callback: () => void) {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (callback) callback();
  });
}

/**
 * Test hook updates
 * @param {Function} hook - The hook to test
 * @param {Object[]} actions - Array of actions to perform on the hook
 * @param {Function} actions[].act - Function to perform on the result
 * @param {Function} actions[].assert - Function to assert the expected result
 * @param {Object} options - Options to pass to renderHook
 * @returns {Object} - The result of renderHook
 */
export async function testHookUpdates<T>(
  hook: () => T, 
  actions: { 
    act?: (result: ReturnType<typeof renderHookWithProviders<T>>) => void, 
    assert?: (result: ReturnType<typeof renderHookWithProviders<T>>) => void 
  }[], 
  options: RenderHookOptions = {}
) {
  const result = renderHookWithProviders(hook, options);
  
  for (const { act: actFn, assert } of actions) {
    if (actFn) {
      await act(async () => {
        actFn(result);
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }
    
    if (assert) {
      assert(result);
    }
  }
  
  return result;
} 