





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping *//**

 * @vitest-environment jsdom
 */


import { renderHookWithProviders, testHookUpdates } from '../../test-utils/hook-testing';
import { useLocalStorage } from '../useLocalStorage';

import { act } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';

describe('useLocalStorage', () => {
  // Mock implementation for localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  // Setup and teardown
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should use the initialValue if no value is found in localStorage', () => {

    // Arrange - ensure localStorage returns null for this key
    localStorageMock.getItem.mockReturnValueOnce(null);

    // Act
    const { result } = renderHookWithProviders(() => useLocalStorage('testKey', 'initialValue'));

    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
    expect(result.current[0]).toBe('initialValue');
  });

  it('should use the value from localStorage if it exists', () => {

    // Arrange - mock a stored value
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('storedValue'));

    // Act
    const { result } = renderHookWithProviders(() => useLocalStorage('testKey', 'initialValue'));

    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update the value in localStorage when setValue is called', async () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(null);

    // Act & Assert
    await testHookUpdates(
      () => useLocalStorage('testKey', 'initialValue'),
      [
        {
          act: (result) => {
            const setValue = result.result.current[1];
            setValue('newValue');
          },
          assert: (result) => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
              'testKey',
              JSON.stringify('newValue'),
            );
            expect(result.result.current[0]).toBe('newValue');
          },
        },
      ],
    );
  });

  it('should update the value using a function', async () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(1));

    // Act & Assert
    await testHookUpdates(
      () => useLocalStorage<number>('counterKey', 1),
      [
        {
          act: (result) => {
            const setValue = result.result.current[1];

            setValue((prev: number) => prev + 1);
          },
          assert: (result) => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith('counterKey', JSON.stringify(2));
            expect(result.result.current[0]).toBe(2);
          },
        },
      ],
    );
  });

  it('should handle errors when reading from localStorage', () => {

    // Arrange - mock console.warn and force an error
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('getItem error');
    });

    // Act
    const { result } = renderHookWithProviders(() => useLocalStorage('testKey', 'fallbackValue'));

    // Assert
    expect(console.warn).toHaveBeenCalled();
    expect(result.current[0]).toBe('fallbackValue');

    // Cleanup
    console.warn = originalConsoleWarn;
  });

  it('should handle errors when writing to localStorage', async () => {

    // Arrange - mock console.warn and force an error
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    localStorageMock.getItem.mockReturnValueOnce(null);
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('setItem error');
    });

    // Act & Assert
    await testHookUpdates(
      () => useLocalStorage('testKey', 'initialValue'),
      [
        {
          act: (result) => {
            const setValue = result.result.current[1];
            setValue('newValue');
          },
          assert: () => {
            expect(console.warn).toHaveBeenCalled();
          },
        },
      ],
    );

    // Cleanup
    console.warn = originalConsoleWarn;
  });
});
