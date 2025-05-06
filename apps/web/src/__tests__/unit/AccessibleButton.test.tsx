/* eslint-disable */
import { render, screen } from '../../test-utils/testing-lib-adapter';
import { userEvent } from '../../test-utils/testing-lib-adapter';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibleButton } from '../../components/AccessibleButton';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Add jest-axe matcher
expect.extend(toHaveNoViolations as unknown as { [key: string]: any });

describe('AccessibleButton Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders with default props', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-10'); // md size
  });

  it('renders with different variants', () => {
    const { rerender } = render(<AccessibleButton variant="primary">Primary</AccessibleButton>);
    let button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-primary');

    rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary');

    rerender(<AccessibleButton variant="outline">Outline</AccessibleButton>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border-input');

    rerender(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<AccessibleButton size="sm">Small</AccessibleButton>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-9');

    rerender(<AccessibleButton size="md">Medium</AccessibleButton>);
    button = screen.getByRole('button', { name: /medium/i });
    expect(button).toHaveClass('h-10');

    rerender(<AccessibleButton size="lg">Large</AccessibleButton>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-11');
  });

  it('renders in loading state', () => {
    render(<AccessibleButton isLoading>Loading</AccessibleButton>);

    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveClass('opacity-50');

    // Check if loading spinner is present
    const loadingSpinner = screen.getByText('⌛');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('renders with icons', () => {
    render(
      <AccessibleButton
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        With Icons
      </AccessibleButton>
    );

    const leftIcon = screen.getByTestId('left-icon');
    const rightIcon = screen.getByTestId('right-icon');

    expect(leftIcon).toBeInTheDocument();
    expect(rightIcon).toBeInTheDocument();
    expect(leftIcon.getAttribute('aria-hidden')).toBe('true');
    expect(rightIcon.getAttribute('aria-hidden')).toBe('true');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should not trigger onClick when disabled', async () => {
    render(
      <AccessibleButton onClick={vi.fn()} disabled>
        Disabled
      </AccessibleButton>
    );

    const button = screen.getByRole('button', { name: /disabled/i });
    await user.click(button);

    expect(vi.fn()).not.toHaveBeenCalled();
  });

  it('should not trigger onClick when loading', async () => {
    const handleClick = vi.fn();
    render(
      <AccessibleButton onClick={handleClick} isLoading>
        Loading
      </AccessibleButton>
    );

    const button = screen.getByRole('button', { name: /loading/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AccessibleButton>Accessible Button</AccessibleButton>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
