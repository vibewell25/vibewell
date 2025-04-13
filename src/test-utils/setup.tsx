import { render } from '@testing-library/react/pure';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

/**
 * Custom test setup utility that combines render and userEvent.setup()
 * This provides proper typing and a cleaner API for tests
 */
export function setup(jsx: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

/**
 * Re-export everything from testing-library/react for convenience
 */
export * from '@testing-library/react/pure';

/**
 * Re-export userEvent for cases where we need direct access
 */
export { userEvent }; 