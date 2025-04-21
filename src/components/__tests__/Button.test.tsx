import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../Button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  // Basic Rendering Tests
  it('renders with default props', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Click Me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  // Variant Tests
  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-outline');
  });

  // Size Tests
  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-md');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-lg');
  });

  // State Tests
  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-disabled');
  });

  it('handles loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-loading');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  // Interaction Tests
  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Accessibility Tests
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports custom aria labels', () => {
    render(<Button aria-label="Custom Label">Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom Label');
  });

  // Focus Management Tests
  it('handles focus correctly', () => {
    render(<Button>Focus Test</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    button.blur();
    expect(button).not.toHaveFocus();
  });

  // Keyboard Navigation Tests
  it('responds to keyboard events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Keyboard Test</Button>);

    const button = screen.getByRole('button');
    button.focus();

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  // Visual Regression Test Setup
  it('matches snapshot', () => {
    const { container } = render(<Button>Snapshot Test</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
