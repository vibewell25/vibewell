/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping *//**
 * @vitest-environment jsdom
 */
import { useState } from 'react';
import { renderHookWithProviders, testHookUpdates } from '../../test-utils/hook-testing';
import { describe, it, expect } from 'vitest';

interface CounterHook {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Example Hook to Test
function useCounter(initialValue = 0): CounterHook {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  return { count, increment, decrement };
}

describe('useCounter', () => {
  it('should initialize with the default value', () => {
    const { result } = renderHookWithProviders<void, CounterHook>(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with the provided value', () => {
    const { result } = renderHookWithProviders<void, CounterHook>(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment count', async () => {
    await testHookUpdates<void, CounterHook>(
      () => useCounter(),
      [
        {
          act: (result) => result.result.current.increment(),
          assert: (result) => {
            expect(result.result.current.count).toBe(1);
          },
        },
      ],
    );
  });

  it('should decrement count', async () => {
    await testHookUpdates<void, CounterHook>(
      () => useCounter(5),
      [
        {
          act: (result) => result.result.current.decrement(),
          assert: (result) => {
            expect(result.result.current.count).toBe(4);
          },
        },
      ],
    );
  });

  it('should handle multiple updates', async () => {
    await testHookUpdates<void, CounterHook>(
      () => useCounter(),
      [
        {
          act: (result) => result.result.current.increment(),
          assert: (result) => {
            expect(result.result.current.count).toBe(1);
          },
        },
        {
          act: (result) => result.result.current.increment(),
          assert: (result) => {
            expect(result.result.current.count).toBe(2);
          },
        },
        {
          act: (result) => result.result.current.decrement(),
          assert: (result) => {
            expect(result.result.current.count).toBe(1);
          },
        },
      ],
    );
  });
});
