import { NavigationContainerRef, StackActions } from '@react-navigation/native';
import { createRef } from 'react';

/**
 * Navigation service for navigating outside of React components
 * This allows services like push notifications to trigger navigation
 */

// Create a navigation reference that can be set from the root navigator
export const navigationRef = createRef<NavigationContainerRef<any>>();

/**
 * Navigate to a specific route in the navigation tree
 * @param name Route name
 * @param params Optional parameters to pass to the route
 */
function navigate(name: string, params?: Record<string, any>): void {
  if (navigationRef.current) {
    // @ts-ignore - We need to use the any type here because the navigation tree is dynamic
    navigationRef.current.navigate(name, params);
  } else {
    // Save the navigation intent for when the navigator is ready
    navigationQueue.push({ type: 'navigate', name, params });
  }
}

/**
 * Push a new route onto the navigation stack
 * @param name Route name
 * @param params Optional parameters to pass to the route
 */
function push(name: string, params?: Record<string, any>): void {
  if (navigationRef.current) {
    navigationRef.current.dispatch(StackActions.push(name, params));
  } else {
    navigationQueue.push({ type: 'push', name, params });
  }
}

/**
 * Go back to the previous screen
 */
function goBack(): void {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  } else {
    navigationQueue.push({ type: 'goBack' });
  }
}

/**
 * Navigate to a nested navigator and reset its state
 * @param name Navigator name
 * @param params Optional parameters
 */
function reset(name: string, params?: Record<string, any>): void {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name, params }],
    });
  } else {
    navigationQueue.push({ type: 'reset', name, params });
  }
}

// Queue for navigation actions when the navigator isn't mounted yet
const navigationQueue: Array<any> = [];

/**
 * Process any queued navigation actions
 * Call this once the navigator is ready
 */
function processNavigationQueue(): void {
  if (!navigationRef.current) return;

  while (navigationQueue.length > 0) {
    const action = navigationQueue.shift();
    if (!action) continue;

    switch (action.type) {
      case 'navigate':
        navigate(action.name, action.params);
        break;
      case 'push':
        push(action.name, action.params);
        break;
      case 'goBack':
        goBack();
        break;
      case 'reset':
        reset(action.name, action.params);
        break;
    }
  }
}

// Export the navigation service functions
export const NavigationService = {
  navigate,
  push,
  goBack,
  reset,
  processNavigationQueue,
};

export default NavigationService; 