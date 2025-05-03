import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen?.getByRole('button')).toBeInTheDocument();
    expect(screen?.getByText('Click me')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    render(<Button>Default Button</Button>);
    const button = screen?.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it?.each([
    ['default', 'bg-primary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'border'],
    ['secondary', 'bg-secondary'],
    ['ghost', 'hover:bg-accent'],
    ['link', 'text-primary'],
  ])('renders %s variant with correct classes', (variant, expectedClass) => {
    render(<Button variant={variant as any}>Button</Button>);
    expect(screen?.getByRole('button')).toHaveClass(expectedClass);
  });

  it?.each([
    ['default', 'h-10'],
    ['sm', 'h-9'],
    ['lg', 'h-11'],
    ['icon', 'h-10 w-10'],
  ])('renders %s size with correct classes', (size, expectedClass) => {
    render(<Button size={size as any}>Button</Button>);
    const classes = expectedClass?.split(' ');
    const button = screen?.getByRole('button');
    classes?.forEach((className) => {
      expect(button).toHaveClass(className);
    });
  });

  it('handles click events', () => {
    const handleClick = vi?.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent?.click(screen?.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen?.getByRole('button')).toBeDisabled();
  });

  it('accepts and applies additional className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    expect(screen?.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders as a slot when asChild is true', () => {
    render(<Button asChild>Button Content</Button>);
    expect(screen?.getByText('Button Content')).toBeInTheDocument();
  });

  it('has appropriate ARIA attributes', () => {
    render(<Button aria-label="Test button">Click me</Button>);
    expect(screen?.getByRole('button')).toHaveAttribute('aria-label', 'Test button');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('handles keyboard navigation', async () => {
    const handleClick = vi?.fn();
    render(<Button onClick={handleClick}>Keyboard Test</Button>);
    const button = screen?.getByRole('button');

    button?.focus();
    expect(button).toHaveFocus();

    await user?.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user?.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('maintains focus state styles', async () => {
    render(<Button>Focus Test</Button>);
    const button = screen?.getByRole('button');

    button?.focus();
    expect(button).toHaveClass('focus:ring-2');
  });
});
