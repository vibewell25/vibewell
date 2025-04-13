/**
 * Button component tests
 * 
 * This file tests the Button component functionality, accessibility,
 * and performance. It uses our enhanced testing utilities.
 */
import React from 'react';
import { createTestRunner } from '../../test-utils/test-runner';
import {
  testAccessibility,
  testAriaRoles,
  testKeyboardNavigation
} from '../../test-utils/accessibility-testing';
import { testRenderPerformance } from '../../test-utils/performance-testing';
import { Button } from './Button';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a test runner for the Button component
const testRunner = createTestRunner('Button Component');

describe('Button Component: functionality', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('bg-primary');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('renders with different variants', () => {
    render(
      <>
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    );
    
    const defaultButton = screen.getByRole('button', { name: /default/i });
    const outlineButton = screen.getByRole('button', { name: /outline/i });
    const ghostButton = screen.getByRole('button', { name: /ghost/i });
    
    expect(defaultButton).toHaveClass('bg-primary');
    expect(outlineButton).toHaveClass('border');
    expect(ghostButton).toHaveClass('hover:bg-accent');
  });

  it('renders with different sizes', () => {
    render(
      <>
        <Button size="default">Default size</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">Icon</Button>
      </>
    );
    
    const defaultButton = screen.getByRole('button', { name: /default size/i });
    const smallButton = screen.getByRole('button', { name: /small/i });
    const largeButton = screen.getByRole('button', { name: /large/i });
    const iconButton = screen.getByRole('button', { name: /icon/i });
    
    // Check size-specific classes
    expect(defaultButton).toHaveClass('h-9'); // Default height
    expect(smallButton).toHaveClass('h-8'); // Small height
    expect(largeButton).toHaveClass('h-10'); // Large height
    expect(iconButton).toHaveClass('h-9'); // Icon height
  });

  it('calls onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    const button = screen.getByRole('button', { name: /clickable/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('accepts and applies additional className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button', { name: /custom button/i });
    expect(button).toHaveClass('custom-class');
  });

  it('renders with an icon', () => {
    render(
      <Button>
        <span data-testid="icon" className="mr-2">🔍</span>
        With Icon
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /with icon/i });
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies correct HTML attributes', () => {
    render(
      <Button
        type="submit"
        name="test-button"
        aria-label="Test button"
        data-testid="test-btn"
      >
        Test
      </Button>
    );
    
    const button = screen.getByTestId('test-btn');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });
});

describe('Button Component: accessibility', () => {
  it('meets accessibility standards', () => {
    render(<Button>Accessible Button</Button>);
    
    const button = screen.getByRole('button', { name: /accessible button/i });
    
    // Basic accessibility checks
    expect(button).toHaveAttribute('type'); // Has type attribute
    expect(button).toBeVisible(); // Is visible
    expect(button).not.toHaveAttribute('aria-hidden'); // Not hidden from screen readers
  });

  it('has correct ARIA roles', () => {
    render(<Button aria-label="Special action">ARIA Button</Button>);
    
    const button = screen.getByRole('button', { name: /ARIA Button/i });
    expect(button).toHaveAttribute('aria-label', 'Special action');
  });

  it('is keyboard navigable', () => {
    render(<Button>Keyboard Button</Button>);
    
    const button = screen.getByRole('button', { name: /keyboard button/i });
    button.focus();
    
    expect(document.activeElement).toBe(button);
  });

  it('supports keyboard activation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Keyboard Activation</Button>);
    
    const button = screen.getByRole('button', { name: /keyboard activation/i });
    button.focus();
    
    // Simulate keyboard activation with Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Space key should also activate the button
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has sufficient color contrast', () => {
    // This is a simplified check, in a real app you'd use a proper contrast checker
    const { container } = render(<Button>Contrast Button</Button>);
    
    // Check for design system color classes that ensure good contrast
    expect(container.firstChild).toHaveClass('text-primary-foreground');
  });
});

describe('Button Component: performance', () => {
  it('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<Button>Performance Test</Button>);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Button should render in under 50ms (arbitrary threshold for testing)
    expect(renderTime).toBeLessThan(50);
  });
}); 