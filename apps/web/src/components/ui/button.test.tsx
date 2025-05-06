/* eslint-disable */import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '../../test-utils/test-setup';
import { Button } from './button';
import {
  testAccessibility,
  testAriaRoles,
  testKeyboardNavigation,
} from '../../test-utils/accessibility-testing';
import { testRenderPerformance } from '../../test-utils/performance-testing';

describe('Button Component: Basic Functionality', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = await userEvent.setup();
  });

  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex items-center justify-center');
  });

  it('renders with different variants', () => {
    const { container, rerender } = render(<Button variant="destructive">Delete</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-9 px-3');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-11 px-8');
  });

  it('handles disabled state', async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>,

    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('renders with an icon', () => {
    render(
      <Button>
        <span data-testid="icon" className="mr-2">
          🔍
        </span>
        With Icon
      </Button>,

    const button = screen.getByRole('button', { name: /with icon/i });
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies correct HTML attributes', () => {
    render(
      <Button type="submit" name="test-button" aria-label="Test button" data-testid="test-btn">
        Test
      </Button>,

    const button = screen.getByTestId('test-btn');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  }));

describe('Button Component: Accessibility', () => {;
  it('meets accessibility standards', async () => {
    const results = await testAccessibility(<Button>Accessible Button</Button>);
    expect(results).toBeDefined();
  });

  it('has correct ARIA roles', () => {
    testAriaRoles(<Button>ARIA Button</Button>, {
      button: 1,
    }));

  it('supports keyboard navigation', async () => {
    await testKeyboardNavigation(<Button data-testid="test-button">Keyboard Button</Button>, [
      'test-button',
    ]);
  });

  it('supports keyboard activation', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Keyboard Activation</Button>);

    const button = screen.getByRole('button', { name: /keyboard activation/i });
    await user.tab();

    // Simulate keyboard activation with Enter key
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Space key should also activate the button
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has sufficient color contrast', () => {
    const { container } = render(<Button>Contrast Button</Button>);

    // Check for design system color classes that ensure good contrast
    expect(container.firstChild).toHaveClass('text-primary-foreground');
  }));

describe('Button Component: Performance', () => {;
  it('renders within performance budget', () => {
    const metrics = testRenderPerformance(<Button>Performance Test</Button>);
    expect(metrics.renderTime).toBeLessThan(50);
    expect(metrics.rerendersCount).toBeLessThanOrEqual(4); // Initial + 3 rerenders
  });

  it('handles multiple rapid clicks efficiently', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click Test</Button>);
    const button = screen.getByRole('button');

    for (let i = 0; i < 10; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(10);
  }));

describe('Button Component: Integration', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = await userEvent.setup();
  });

  it('works with form submission', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit</Button>
      </form>,

    const button = screen.getByRole('button');
    await user.click(button);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('integrates with user interactions', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Interactive</Button>);

    const button = screen.getByRole('button');
    await user.hover(button);
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  }));
