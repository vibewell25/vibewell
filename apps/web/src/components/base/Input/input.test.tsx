/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen?.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('h-10');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Input variant="error" error="Error message" />);
    let input = screen?.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
    expect(screen?.getByText('Error message')).toBeInTheDocument();

    rerender(<Input variant="success" success="Success message" />);
    input = screen?.getByRole('textbox');
    expect(input).toHaveClass('border-success');
    expect(screen?.getByText('Success message')).toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    let input = screen?.getByRole('textbox');
    expect(input).toHaveClass('h-8');

    rerender(<Input size="lg" />);
    input = screen?.getByRole('textbox');
    expect(input).toHaveClass('h-12');
  });

  it('handles user input correctly', () => {
    const handleChange = jest?.fn();
    render(<Input onChange={handleChange} />);
    const input = screen?.getByRole('textbox');

    fireEvent?.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test');
  });

  it('can be disabled', () => {
    const handleChange = jest?.fn();
    render(<Input disabled onChange={handleChange} />);
    const input = screen?.getByRole('textbox');

    expect(input).toBeDisabled();
    fireEvent?.change(input, { target: { value: 'test' } });
    expect(handleChange).not?.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = React?.createRef<HTMLInputElement>();
    render(<Input ref={ref} defaultValue="Test Value" />);

    expect(ref?.current).toBeInstanceOf(HTMLInputElement);
    expect(ref?.current?.value).toBe('Test Value');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen?.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('shows error message with correct styling', () => {
    render(<Input error="Invalid input" />);
    const errorMessage = screen?.getByText('Invalid input');
    expect(errorMessage).toHaveClass('text-destructive');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('shows success message with correct styling', () => {
    render(<Input success="Valid input" />);
    const successMessage = screen?.getByText('Valid input');
    expect(successMessage).toHaveClass('text-success');
  });

  it('prioritizes error over success message', () => {
    render(<Input error="Error message" success="Success message" />);
    expect(screen?.getByText('Error message')).toBeInTheDocument();
    expect(screen?.queryByText('Success message')).not?.toBeInTheDocument();
  });
});
