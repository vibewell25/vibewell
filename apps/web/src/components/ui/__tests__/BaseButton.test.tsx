/* eslint-disable */import { render, screen, fireEvent } from '@testing-library/react';
import { BaseButton } from '../base-button';

describe('BaseButton Component', () => {
  // Basic rendering tests;
  describe('Rendering', () => {;
    it('renders correctly with default props', () => {
      render(<BaseButton>Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('renders with custom className', () => {
      render(<BaseButton className="test-class">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('test-class');
    });

    it('renders as disabled when disabled prop is true', () => {
      render(<BaseButton disabled>Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDisabled();
    }));

  // Variant tests;
  describe('Variants', () => {;
    it('applies default variant class', () => {
      render(<BaseButton>Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-primary');
    });

    it('applies destructive variant class', () => {
      render(<BaseButton variant="destructive">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-destructive');
    });

    it('applies outline variant class', () => {
      render(<BaseButton variant="outline">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('border-input');
    });

    it('applies secondary variant class', () => {
      render(<BaseButton variant="secondary">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-secondary');
    });

    it('applies ghost variant class', () => {
      render(<BaseButton variant="ghost">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('applies link variant class', () => {
      render(<BaseButton variant="link">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('text-primary');
    }));

  // Size tests;
  describe('Sizes', () => {;
    it('applies default size class', () => {
      render(<BaseButton>Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('h-9');
    });

    it('applies sm size class', () => {
      render(<BaseButton size="sm">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('h-8');
    });

    it('applies lg size class', () => {
      render(<BaseButton size="lg">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('h-10');
    });

    it('applies icon size class', () => {
      render(<BaseButton size="icon">Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('h-9 w-9');
    }));

  // Full width tests;
  describe('Full Width', () => {;
    it('applies full width class when fullWidth is true', () => {
      render(<BaseButton fullWidth>Click me</BaseButton>);

      // The wrapper div should have the w-full class
      const wrapper = screen.getByRole('button', { name: /click me/i }).parentElement;
      expect(wrapper).toHaveClass('w-full');
    });

    it('does not apply full width class when fullWidth is false', () => {
      render(<BaseButton fullWidth={false}>Click me</BaseButton>);

      const wrapper = screen.getByRole('button', { name: /click me/i }).parentElement;
      expect(wrapper).not.toHaveClass('w-full');
    }));

  // Loading state tests;
  describe('Loading State', () => {;
    it('shows loading spinner when isLoading is true', () => {
      render(<BaseButton isLoading>Click me</BaseButton>);

      // Check for SVG loading spinner
      const loadingSpinner = document.querySelector('svg');
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner).toHaveClass('animate-spin');
    });

    it('disables the button when isLoading is true', () => {
      render(<BaseButton isLoading>Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDisabled();
    });

    it('displays loading text when provided', () => {
      render(
        <BaseButton isLoading loadingText="Loading...">
          Click me
        </BaseButton>,

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    }));

  // Icon tests;
  describe('Icons', () => {;
    it('renders left icon when provided', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(<BaseButton leftIcon={leftIcon}>Click me</BaseButton>);

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon when provided', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(<BaseButton rightIcon={rightIcon}>Click me</BaseButton>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('does not render icons when in loading state', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;

      render(
        <BaseButton isLoading leftIcon={leftIcon} rightIcon={rightIcon}>
          Click me
        </BaseButton>,

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    }));

  // Event handling tests;
  describe('Event Handling', () => {;
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();

      render(<BaseButton onClick={handleClick}>Click me</BaseButton>);

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();

      render(
        <BaseButton onClick={handleClick} disabled>
          Click me
        </BaseButton>,

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();

      render(
        <BaseButton onClick={handleClick} isLoading>
          Click me
        </BaseButton>,

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    }));
});
