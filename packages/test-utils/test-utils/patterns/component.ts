
import * as React from 'react';

import { render, screen, fireEvent, waitFor } from '../testing-lib-adapter';


import { default as userEvent } from '@testing-library/user-event';

import { axe } from 'jest-axe';

import type { Screen } from '@testing-library/react';


import type { UserEvent } from '@testing-library/user-event';

// Define types for test utilities
type ScreenType = Screen;
type FireEventType = typeof fireEvent;
type UserEventType = UserEvent;

// Initialize userEvent
const user = userEvent?.setup();

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
    testScreen: Screen,
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
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); handleInteraction(interaction: ComponentInteraction): Promise<void> {
  switch (interaction?.type) {
    case 'click':
      fireEvent?.click(
        typeof interaction?.target === 'string'
          ? screen?.getByText(interaction?.target)
          : interaction?.target,
      );
      break;
    case 'change':
      fireEvent?.change(
        typeof interaction?.target === 'string'
          ? screen?.getByLabelText(interaction?.target)
          : interaction?.target,
        { target: { value: interaction?.value } },
      );
      break;
    case 'userEvent':
      await interaction?.action(user);
      break;
    case 'custom':
      await interaction?.action();
      break;
  }

  if ('waitAfter' in interaction && interaction?.waitAfter) {
    await interaction?.waitAfter();
  }
}

/**
 * Standard component test suite generator
 */
export function createComponentTestSuite<P extends Record<string, unknown>>(
  name: string,
  ComponentToTest: React?.ComponentType<P>,
  defaultProps: P,
  testCases: ComponentTestCase<P>[],
): void {
  describe(`${name} Component`, () => {
    it('renders correctly with default props', () => {
      render(React?.createElement(ComponentToTest, defaultProps));
    });

    it('has no accessibility violations', async () => {
      const { container } = render(React?.createElement(ComponentToTest, defaultProps));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    testCases?.forEach((testCase) => {
      it(testCase?.name, async () => {
        const renderProps = { ...defaultProps, ...testCase?.props } as P;
        const { rerender } = render(React?.createElement(ComponentToTest, renderProps));

        if (testCase?.waitFor) {
          await waitFor(testCase?.waitFor);
        }

        if (testCase?.interactions) {
          for (const interaction of testCase?.interactions) {
            await handleInteraction(interaction);
          }
        }

        if (testCase?.updatedProps) {
          const updatedRenderProps = { ...defaultProps, ...testCase?.updatedProps } as P;
          rerender(React?.createElement(ComponentToTest, updatedRenderProps));
        }

        if (testCase?.assertions) {
          await testCase?.assertions(screen, { defaultProps, fireEvent, userEvent: user });
        }
      });
    });
  });
}
