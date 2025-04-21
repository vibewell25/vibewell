import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders the button with default properties', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  test('renders the button with different variants', () => {
    // Test destructive variant
    const { rerender } = render(<Button variant="destructive">Destructive</Button>);
    let button = screen.getByRole('button', { name: /destructive/i });
    expect(button).toHaveClass('bg-destructive');

    // Test outline variant
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border-input');

    // Test secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary');

    // Test ghost variant
    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');

    // Test link variant
    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: /link/i });
    expect(button).toHaveClass('text-primary');
  });

  test('renders the button with different sizes', () => {
    // Test small size
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-8');

    // Test large size
    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-10');

    // Test icon size
    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /icon/i });
    expect(button).toHaveClass('h-9 w-9');
  });

  test('renders as a different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>
    );

    const linkButton = screen.getByRole('link', { name: /link button/i });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', 'https://example.com');
    expect(linkButton).toHaveClass('bg-primary');
  });

  test('passes additional props to the button', () => {
    render(
      <Button disabled data-testid="test-button">
        Disabled Button
      </Button>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toBeDisabled();
  });

  test('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    const button = screen.getByRole('button', { name: /clickable/i });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
