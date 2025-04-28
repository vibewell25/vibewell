/**
 * Component Test Patterns
 *
 * This file provides standardized patterns for testing React components.
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '../testing-lib-adapter';
import { userEvent as createUserEvent } from '@testing-library/user-event';
import { axe } from 'jest-axe';

/**
 * Component Test Patterns
 *
 * This file provides standardized patterns for testing React components.
 */

// Define types for test utilities
type ScreenType = typeof screen;
type FireEventType = typeof fireEvent;
type UserEventType = ReturnType<typeof createUserEvent.setup>;

// Initialize userEvent
const userEvent = createUserEvent.setup();

/**
 * Component interaction types
 */
export type ComponentInteraction =
  | { type: 'click'; target: string | Element }
  | { type: 'change'; target: string | Element; value: unknown }
  | { type: 'userEvent'; action: (user: UserEventType) => Promise<void> }
  | { type: 'custom'; action: () => Promise<void> }
  | ({ type: 'click' | 'change'; target: string | Element; value?: unknown } & {
      waitAfter?: () => Promise<void> | void;
    });

/**
 * Component test case configuration
 */
export interface ComponentTestCase<P extends Record<string, unknown>> {
  name: string;
  props?: Partial<P>;
  updatedProps?: Partial<P>;
  waitFor?: () => Promise<void> | void;
  interactions?: ComponentInteraction[];
  assertions?: (
    testScreen: ScreenType,
    utils: {
      defaultProps: P;
      fireEvent: FireEventType;
      userEvent: UserEventType;
    },
  ) => Promise<void> | void;
}

/**
 * Handles component interactions based on the interaction type
 */
export async function handleInteraction(interaction: ComponentInteraction): Promise<void> {
  switch (interaction.type) {
    case 'click':
      fireEvent.click(
        typeof interaction.target === 'string'
          ? screen.getByText(interaction.target)
          : interaction.target,
      );
      break;
    case 'change':
      fireEvent.change(
        typeof interaction.target === 'string'
          ? screen.getByLabelText(interaction.target)
          : interaction.target,
        { target: { value: interaction.value } },
      );
      break;
    case 'userEvent':
      await interaction.action(userEvent);
      break;
    case 'custom':
      await interaction.action();
      break;
  }

  if ('waitAfter' in interaction && interaction.waitAfter) {
    await interaction.waitAfter();
  }
}

/**
 * Standard component test suite generator
 * Creates a standard set of tests for a React component
 *
 * @param name - Component name
 * @param ComponentToTest - The React component to test
 * @param defaultProps - Default props for the component
 * @param testCases - Test cases for the component
 */
export function createComponentTestSuite<P extends Record<string, unknown>>(
  name: string,
  ComponentToTest: React.ComponentType<P>,
  defaultProps: P,
  testCases: ComponentTestCase<P>[],
): void {
  describe(`${name} Component`, () => {
    // Rendering test
    it('renders correctly with default props', () => {
      render(React.createElement(ComponentToTest, defaultProps));
    });

    // Accessibility test
    it('has no accessibility violations', async () => {
      const { container } = render(React.createElement(ComponentToTest, defaultProps));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    // Run all test cases
    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const renderProps = { ...defaultProps, ...testCase.props } as P;
        const { rerender } = render(React.createElement(ComponentToTest, renderProps));

        // Wait for any async rendering if needed
        if (testCase.waitFor) {
          await waitFor(testCase.waitFor);
        }

        // Perform interactions if defined
        if (testCase.interactions) {
          for (const interaction of testCase.interactions) {
            await handleInteraction(interaction);
          }
        }

        // Rerender with updated props if needed
        if (testCase.updatedProps) {
          const updatedRenderProps = { ...defaultProps, ...testCase.updatedProps } as P;
          rerender(React.createElement(ComponentToTest, updatedRenderProps));
        }

        // Run assertions
        if (testCase.assertions) {
          await testCase.assertions(screen, { defaultProps, fireEvent, userEvent });
        }
      });
    });
  });
}
