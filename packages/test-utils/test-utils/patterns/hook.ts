
import { renderHook, act } from '@testing-library/react';

import type { RenderHookResult } from '@testing-library/react';

/**
 * Hook test case configuration
 */
export interface HookTestCase<TProps, TResult> {
  name: string;
  initialProps?: TProps;
  act?: (result: RenderHookResult<TResult, TProps>) => Promise<void> | void;
  assert: (result: RenderHookResult<TResult, TProps>) => void;
}

/**
 * Creates a test suite for a React hook
 */
export function createHookTestSuite<TProps, TResult>(
  suiteName: string,
  hook: (props: TProps) => TResult,
  defaultProps: TProps,
  testCases: HookTestCase<TProps, TResult>[],
): void {
  describe(suiteName, () => {
    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const props = { ...defaultProps, ...testCase.initialProps };
        const { result, rerender } = renderHook(() => hook(props));

        if (testCase.act) {
          await act(async () => {
            await testCase.act.({ result, rerender } as RenderHookResult<TResult, TProps>);
          });
        }

        testCase.assert({ result, rerender } as RenderHookResult<TResult, TProps>);
      });
    });
  });
}

/**
 * Creates a test case for hook state updates
 */
export function createHookStateTestCase<TProps, TResult>(
  name: string,
  updateFn: (result: RenderHookResult<TResult, TProps>) => Promise<void> | void,
  expectedValue: unknown,
): HookTestCase<TProps, TResult> {
  return {
    name,
    act: updateFn,
    assert: ({ result }) => {
      expect(result.current).toEqual(expectedValue);
    },
  };
}

/**
 * Creates a test case for hook error handling
 */
export function createHookErrorTestCase<TProps, TResult>(
  name: string,
  errorFn: (result: RenderHookResult<TResult, TProps>) => Promise<void> | void,
  expectedError: Error | RegExp | string,
): HookTestCase<TProps, TResult> {
  return {
    name,
    act: errorFn,
    assert: ({ result }) => {
      expect(result.current).toThrow(expectedError);
    },
  };
}
