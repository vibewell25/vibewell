import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import 'jest-axe/extend-expect';
import { Button } from './Button';

describe('Button Accessibility', () => {
  it('should have no accessibility violations in different states', async () => {
    const { container: defaultContainer } = render(<Button>Default Button</Button>);
    expect(await axe(defaultContainer)).toHaveNoViolations();

    const { container: disabledContainer } = render(<Button disabled>Disabled Button</Button>);
    expect(await axe(disabledContainer)).toHaveNoViolations();

    const { container: loadingContainer } = render(<Button loading>Loading Button</Button>);
    expect(await axe(loadingContainer)).toHaveNoViolations();
  });

  it('should have proper ARIA attributes for different states', () => {
    render(<Button>Click me</Button>);
    let button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-disabled');

    // Test disabled state
    render(<Button disabled>Disabled</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeDisabled();

    // Test loading state
    render(<Button loading>Loading</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should support custom ARIA attributes', () => {
    render(
      <Button aria-label="Custom action" aria-describedby="tooltip-1" aria-controls="panel-1">
        Custom ARIA
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom action');
    expect(button).toHaveAttribute('aria-describedby', 'tooltip-1');
    expect(button).toHaveAttribute('aria-controls', 'panel-1');
  });

  it('should handle focus management correctly', () => {
    render(<Button>Focus Test</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus-visible:ring-2');

    button.blur();
    expect(button).not.toHaveFocus();
  });

  it('should be keyboard accessible', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Keyboard Test</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
