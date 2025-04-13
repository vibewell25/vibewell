/**
 * Utilities for testing React hooks
 */
import React from 'react';
import { render, renderHook, act } from '@testing-library/react';

/**
 * Create a wrapper component for testing hooks with context providers
 * @param {React.ComponentType<any>} providers - Array of context providers to wrap the hook with
 * @returns {React.FC} - Wrapper component
 */
export function createWrapperWithProviders(providers = []) {
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
 * @param {React.ComponentType<any>[]} options.providers - Array of context providers
 * @returns {Object} - The result of renderHook
 */
export function renderHookWithProviders(hook, { providers = [], ...options } = {}) {
  const wrapper = createWrapperWithProviders(providers);
  return renderHook(hook, { wrapper, ...options });
}

/**
 * Wait for an async event to complete
 * @param {Function} callback - Callback to run after waiting
 * @returns {Promise<void>}
 */
export async function waitForAsyncEvents(callback) {
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
export async function testHookUpdates(hook, actions, options = {}) {
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