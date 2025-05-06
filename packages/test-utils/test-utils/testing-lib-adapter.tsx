/**
 * Testing Library Adapter
 *
 * This adapter provides a consistent interface to @testing-library/react
 * across different versions, ensuring our test utilities work correctly.
 */

// Use require instead of import to avoid TypeScript errors with newer versions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactTestingLibrary = require('@testing-library/react');

// Include userEvent for tests
// eslint-disable-next-line @typescript-eslint/no-var-requires
const userEventLib = require('@testing-library/user-event');

// Export the methods
export const render = ReactTestingLibrary.render;
export const screen = ReactTestingLibrary.screen;
export const fireEvent = ReactTestingLibrary.fireEvent;
export const within = ReactTestingLibrary.within;
export const waitFor = ReactTestingLibrary.waitFor;
export const cleanup = ReactTestingLibrary.cleanup;
export const act = ReactTestingLibrary.act;

// Export userEvent for user interaction testing
export {};

// Define proper types for users of this adapter
export type RenderResult = ReturnType<typeof ReactTestingLibrary.render>;
export type RenderOptions = Parameters<typeof ReactTestingLibrary.render>[1];
