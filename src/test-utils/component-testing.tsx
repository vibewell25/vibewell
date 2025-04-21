// @ts-nocheck
/**
 * Component testing utilities
 *
 * This file provides specialized utilities for testing UI components,
 * including accessibility testing and common UI testing patterns.
 */
import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  cleanup as testingCleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ThemeProvider } from '../components/theme-provider';

/**
 * Create a wrapper component for testing components with context providers
 * @param providers - Array of context providers to wrap the component with
 * @returns Wrapper component
 */
export function createWrapperWithProviders(providers = []) {
  return ({ children }) => {
    return providers.reduceRight((acc, Provider) => {
      // @ts-expect-error - JSX in .ts file
      return <Provider>{acc}</Provider>;
    }, children);
  };
}

/**
 * Render a component with default providers
 * @param ui - Component to render
 * @param options - Render options
 * @returns Rendered component
 */
export function renderWithProviders(ui, options = {}) {
  // @ts-expect-error - Ignore property does not exist errors
  const { wrapper: CustomWrapper, theme = 'light', ...renderOptions } = options;

  function Wrapper({ children }) {
    // @ts-expect-error - JSX in .ts file
    return (
      // @ts-expect-error - Prop may not exist on ThemeProvider
      <ThemeProvider initialTheme={theme}>
        {CustomWrapper ? (
          // @ts-expect-error - JSX in .ts file
          <CustomWrapper>{children}</CustomWrapper>
        ) : (
          children
        )}
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Render a component and test for accessibility violations
 * @param ui - Component to render
 * @param options - Render options
 * @returns Rendered component and axe results
 */
export async function renderWithAccessibilityCheck(ui, options = {}) {
  // @ts-expect-error - Ignore property does not exist errors
  const { axeOptions, ...renderOptions } = options;
  const renderResult = renderWithProviders(ui, renderOptions);

  // Run axe on the rendered component
  const axeResults = await axe(renderResult.container, axeOptions);

  return {
    ...renderResult,
    axeResults,
  };
}

/**
 * Test a form component
 * @param formComponent - Form component
 * @param options - Test options
 * @returns Test results
 */
export async function testForm({
  formComponent,
  submitButtonText = 'Submit',
  inputData = {},
  onSubmitMock = jest.fn(),
  expectedErrors = {},
  successMessage = null,
  renderOptions = {},
}) {
  // Render the form
  const user = userEvent.setup();
  const result = renderWithProviders(formComponent, renderOptions);

  // Fill in the form
  for (const [fieldName, value] of Object.entries(inputData)) {
    const input =
      screen.getByLabelText(fieldName, { exact: false }) ||
      screen.getByPlaceholderText(fieldName, { exact: false }) ||
      screen.getByTestId(`input-${fieldName}`);

    // @ts-expect-error - Ignore property access issues
    if (input.type === 'checkbox') {
      if (value) {
        await user.click(input);
      }
      // @ts-expect-error - Ignore property access issues
    } else if (input.type === 'select-one') {
      // @ts-expect-error - Ignore type compatibility issues
      await user.selectOptions(input, value);
      // @ts-expect-error - Ignore property access issues
    } else if (input.type === 'radio') {
      // @ts-expect-error - Ignore type compatibility issues
      const radioOption = screen.getByLabelText(value);
      await user.click(radioOption);
    } else {
      // @ts-expect-error - Ignore type compatibility issues
      await user.type(input, value);
    }
  }

  // Submit the form
  const submitButton = screen.getByRole('button', { name: submitButtonText });
  await user.click(submitButton);

  // Check for errors
  if (Object.keys(expectedErrors).length > 0) {
    for (const [fieldName, errorMessage] of Object.entries(expectedErrors)) {
      // @ts-expect-error - Ignore type compatibility issues
      const errorElement = await screen.findByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
    }
  }

  // Check for success
  if (successMessage) {
    const successElement = await screen.findByText(successMessage);
    expect(successElement).toBeInTheDocument();
  }

  return {
    ...result,
    user,
  };
}

/**
 * Test a modal or dialog component
 * @param {React.ReactElement} triggerComponent - Component that triggers the modal
 * @param {string} modalTitle - Title of the modal
 * @param {string} triggerText - Text of the trigger element
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Test results
 */
export async function testModal({
  triggerComponent,
  modalTitle,
  triggerText,
  closeButtonText = 'Close',
  testContent = null,
  modalShouldClose = true,
  renderOptions = {},
}) {
  // Render the component that contains the modal trigger
  const user = userEvent.setup();
  const result = renderWithProviders(triggerComponent, renderOptions);

  // Find and click the trigger element
  const triggerElement = screen.getByText(triggerText);
  await user.click(triggerElement);

  // Check if modal is open
  const modalTitleElement = await screen.findByText(modalTitle);
  expect(modalTitleElement).toBeInTheDocument();

  // Check for specific content if provided
  if (testContent) {
    const contentElement = await screen.findByText(testContent);
    expect(contentElement).toBeInTheDocument();
  }

  // Close the modal if required
  if (modalShouldClose) {
    const closeButton = screen.getByText(closeButtonText);
    await user.click(closeButton);

    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByText(modalTitle)).not.toBeInTheDocument();
    });
  }

  return {
    ...result,
    user,
  };
}

/**
 * Test a component that uses async loading (like data fetching)
 * @param {React.ReactElement} component - Component to test
 * @param {string} loadingText - Text to show during loading
 * @param {string} loadedText - Text to expect after loading
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Test results
 */
export async function testAsyncComponent({
  component,
  loadingText = 'Loading...',
  loadedText,
  errorText = null,
  shouldError = false,
  renderOptions = {},
}) {
  // Render the component
  const result = renderWithProviders(component, renderOptions);

  // Check for loading state
  const loadingElement = screen.getByText(loadingText);
  expect(loadingElement).toBeInTheDocument();

  if (shouldError) {
    // Wait for error state
    const errorElement = await screen.findByText(errorText);
    expect(errorElement).toBeInTheDocument();
  } else {
    // Wait for loaded state
    const loadedElement = await screen.findByText(loadedText);
    expect(loadedElement).toBeInTheDocument();
    expect(screen.queryByText(loadingText)).not.toBeInTheDocument();
  }

  return result;
}

/**
 * Test a component for dark mode support
 * @param component - Component to test
 * @param themeCheck - Function to check theme-specific values
 * @returns Light and dark mode test results
 */
export function testThemeSupport(component, themeCheck) {
  // Test in light mode
  const lightResult = renderWithProviders(component, { theme: 'light' });
  themeCheck(lightResult, 'light');
  // @ts-expect-error - Use imported testingCleanup
  testingCleanup();

  // Test in dark mode
  const darkResult = renderWithProviders(component, { theme: 'dark' });
  themeCheck(darkResult, 'dark');

  return {
    lightResult,
    darkResult,
  };
}

/**
 * Setup userEvent for component interactions
 * @returns {Object} - The userEvent object with setup
 */
export function setupUserEvent() {
  return userEvent.setup();
}

/**
 * Test accessibility of a component
 * @param {React.ReactElement} ui - The component to test
 * @param {Object} options - The options to pass to render
 * @returns {Promise<Object>} - The axe results
 */
export async function testAccessibility(ui, options = {}) {
  const { container } = renderWithProviders(ui, options);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test component interactions
 * @param {React.ReactElement} ui - The component to test
 * @param {Object[]} interactions - Array of interactions to perform
 * @param {Function} interactions[].action - Function to perform on the result
 * @param {Function} interactions[].assert - Function to assert the expected result
 * @param {Object} options - Options to pass to render
 * @returns {Object} - The result of render
 */
export async function testComponentInteractions(ui, interactions, options = {}) {
  const result = renderWithProviders(ui, options);
  const user = setupUserEvent();

  for (const { action, assert } of interactions) {
    if (action) {
      await action(result, user);
    }

    if (assert) {
      assert(result);
    }
  }

  return result;
}
