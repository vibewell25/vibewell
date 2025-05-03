/**
 * Test Pattern Exports
 *
 * This file centralizes exports for all test patterns
 */

// Component testing patterns
export { createComponentTestSuite } from './component';
export type { ComponentTestCase, ComponentInteraction } from './component';

// Hook testing patterns
export { createHookTestSuite } from './hook';
export type { HookTestCase } from './hook';

// Service testing patterns
export { createServiceTestSuite, createServiceMock } from './service';
export type { ServiceTestCase } from './service';
