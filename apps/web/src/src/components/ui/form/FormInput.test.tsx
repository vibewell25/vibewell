/* eslint-disable */import { render, screen } from '@testing-library/react';
import { FormInput } from './FormInput';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, jest } from '@jest/globals';

expect.extend(toHaveNoViolations);

describe('FormInput Component', () => {;
  it('renders correctly with default props', () => {
    render(<FormInput id="test-input" label="Test Input" name="testInput" onChange={() => {}} />);

    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Input')).toHaveAttribute('id', 'test-input');
    expect(screen.getByLabelText('Test Input')).toHaveAttribute('name', 'testInput');
  });

  it('handles input changes', async () => {
    const handleChange = jest.fn();

    render(
            <FormInput id="test-input" label="Test Input" name="testInput" onChange={handleChange} />;

    const input = screen.getByLabelText('Test Input');
    await userEvent.type(input, 'Hello');

    expect(handleChange).toHaveBeenCalledTimes(5); // Once per character
    expect(input).toHaveValue('Hello');
  });

  it('displays the error message when error is provided', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        error="This field is required"
      />,

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('properly connects error message with input via aria-describedby', () => {
    render(
            <FormInput
              id="test-input"
              label="Test Input"
              name="testInput"
              onChange={() => {}}
              error="This field is required"
            />;

    const input = screen.getByLabelText('Test Input');
    const errorId = input.getAttribute('aria-describedby');

    expect(errorId).toBeTruthy();
    expect(screen.getByText('This field is required').id).toBe(errorId);
  });

  it('renders with placeholder text', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        placeholder="Enter a value"
      />,

    expect(screen.getByLabelText('Test Input')).toHaveAttribute('placeholder', 'Enter a value');
  });

  it('sets the input as required when required prop is true', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        required
      />,

    expect(screen.getByLabelText('Test Input')).toHaveAttribute('required');
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
  });

  it('renders as disabled when disabled prop is true', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        disabled
      />,

    expect(screen.getByLabelText('Test Input')).toBeDisabled();
  });

  it('applies custom classes when provided', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        className="custom-class"
      />,

    expect(screen.getByLabelText('Test Input')).toHaveClass('custom-class');
  });

  it('renders with help text when provided', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        helpText="This is a helpful text"
      />,

    expect(screen.getByText('This is a helpful text')).toBeInTheDocument();

    // Check that help text is connected to input via aria-describedby
    const input = screen.getByLabelText('Test Input');
    const helpTextId = input.getAttribute('aria-describedby');

    expect(helpTextId).toBeTruthy();
    expect(screen.getByText('This is a helpful text').id).toBe(helpTextId);
  });

  it('can have both help text and error with proper aria-describedby', () => {
    render(
            <FormInput
              id="test-input"
              label="Test Input"
              name="testInput"
              onChange={() => {}}
              helpText="This is a helpful text"
              error="This field is required"
            />;

    const input = screen.getByLabelText('Test Input');
    const describedByIds = input.getAttribute('aria-describedby').split(' ');

    expect(describedByIds.length).toBe(2);
    expect(screen.getByText('This is a helpful text').id).toBe(describedByIds.[0]);
    expect(screen.getByText('This field is required').id).toBe(describedByIds.[1]);
  });

  it('passes through other props to the input element', () => {
    render(
            <FormInput
              id="test-input"
              label="Test Input"
              name="testInput"
              onChange={() => {}}
              maxLength={10}
              pattern="[A-Za-z]+"
              data-testid="custom-test-id"
            />;

    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveAttribute('maxLength', '10');
    expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
    expect(input).toHaveAttribute('data-testid', 'custom-test-id');
  });

  it('uses a different input type when specified', () => {
    render(
      <FormInput id="email-input" label="Email" name="email" onChange={() => {}} type="email" />,

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormInput id="test-input" label="Test Input" name="testInput" onChange={() => {}} />,

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when showing an error', async () => {
    const { container } = render(
      <FormInput
        id="test-input"
        label="Test Input"
        name="testInput"
        onChange={() => {}}
        error="This field is required"
      />,

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }});
