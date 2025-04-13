/**
 * Component testing utilities
 * 
 * This file provides specialized utilities for testing UI components,
 * including accessibility testing and common UI testing patterns.
 */
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ThemeProvider } from '../components/theme-provider';

/**
 * Create a wrapper component for testing components with context providers
 * @param {React.ComponentType<any>} providers - Array of context providers to wrap the component with
 * @returns {React.FC} - Wrapper component
 */
export function createWrapperWithProviders(providers = []) {
  return ({ children }) => {
    return providers.reduceRight((acc, Provider) => {
      return <Provider>{acc}</Provider>;
    }, children);
  };
}

/**
 * Custom renderer that wraps components with necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} - Rendered component
 */
export function renderWithProviders(ui, options = {}) {
  const { 
    // Extract wrappers and other options
    wrapper: CustomWrapper, 
    theme = 'light',
    ...renderOptions 
  } = options;

  // Create a wrapper with the ThemeProvider
  const Wrapper = ({ children }) => {
    return (
      <ThemeProvider initialTheme={theme}>
        {children}
      </ThemeProvider>
    );
  };

  // If a custom wrapper is provided, wrap it around our default wrapper
  const FinalWrapper = CustomWrapper
    ? ({ children }) => (
        <Wrapper>
          <CustomWrapper>{children}</CustomWrapper>
        </Wrapper>
      )
    : Wrapper;

  return render(ui, { wrapper: FinalWrapper, ...renderOptions });
}

/**
 * Render a component and test for accessibility violations
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Promise<Object>} - Rendered component and axe results
 */
export async function renderWithAccessibilityCheck(ui, options = {}) {
  const { axeOptions, ...renderOptions } = options;
  const renderResult = renderWithProviders(ui, renderOptions);
  
  // Run axe on the rendered component
  const axeResults = await axe(renderResult.container, axeOptions);
  
  return {
    ...renderResult,
    axeResults
  };
}

/**
 * Test a form component
 * @param {React.ReactElement} formComponent - Form component
 * @param {Object} options - Test options
 * @returns {Promise<Object>} - Test results
 */
export async function testForm({
  formComponent,
  submitButtonText = 'Submit',
  inputData = {},
  onSubmitMock = jest.fn(),
  expectedErrors = {},
  successMessage = null,
  renderOptions = {}
}) {
  // Render the form
  const user = userEvent.setup();
  const result = renderWithProviders(formComponent, renderOptions);
  
  // Fill in the form
  for (const [fieldName, value] of Object.entries(inputData)) {
    const input = screen.getByLabelText(fieldName, { exact: false }) || 
                 screen.getByPlaceholderText(fieldName, { exact: false }) ||
                 screen.getByTestId(`input-${fieldName}`);
    
    if (input.type === 'checkbox') {
      if (value) {
        await user.click(input);
      }
    } else if (input.type === 'select-one') {
      await user.selectOptions(input, value);
    } else if (input.type === 'radio') {
      const radioOption = screen.getByLabelText(value);
      await user.click(radioOption);
    } else {
      await user.type(input, value);
    }
  }
  
  // Submit the form
  const submitButton = screen.getByRole('button', { name: submitButtonText });
  await user.click(submitButton);
  
  // Check for errors
  if (Object.keys(expectedErrors).length > 0) {
    for (const [fieldName, errorMessage] of Object.entries(expectedErrors)) {
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
    user
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
  renderOptions = {}
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
    user
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
  renderOptions = {}
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
 * @param {React.ReactElement} component - Component to test
 * @param {Function} themeCheck - Function to check theme-specific values
 * @returns {Object} - Light and dark mode test results
 */
export function testThemeSupport(component, themeCheck) {
  // Test in light mode
  const lightResult = renderWithProviders(component, { theme: 'light' });
  themeCheck(lightResult, 'light');
  cleanup();
  
  // Test in dark mode
  const darkResult = renderWithProviders(component, { theme: 'dark' });
  themeCheck(darkResult, 'dark');
  
  return {
    lightResult,
    darkResult
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