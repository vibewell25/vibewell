import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { FormInput, FormSelect, FormCheckbox, FormRadio, FormTextarea } from '../form';

describe('Form Components', () => {
  const user = userEvent.setup();

  describe('FormInput', () => {
    const defaultProps = {
      label: 'Test Input',
      name: 'test',
      onChange: vi.fn(),
      error: '',
    };

    it('renders correctly', () => {
      render(<FormInput {...defaultProps} />);
      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    });

    it('handles user input', async () => {
      render(<FormInput {...defaultProps} />);
      const input = screen.getByLabelText('Test Input');
      await user.type(input, 'test value');
      expect(defaultProps.onChange).toHaveBeenCalled();
      expect(input).toHaveValue('test value');
    });

    it('displays error message', () => {
      render(<FormInput {...defaultProps} error="Required field" />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('supports different input types', () => {
      render(<FormInput {...defaultProps} type="password" />);
      expect(screen.getByLabelText('Test Input')).toHaveAttribute('type', 'password');
    });
  });

  describe('FormSelect', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    const defaultProps = {
      label: 'Test Select',
      name: 'test',
      options,
      onChange: vi.fn(),
      error: '',
    };

    it('renders correctly with options', () => {
      render(<FormSelect {...defaultProps} />);
      expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
      options.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('handles option selection', async () => {
      render(<FormSelect {...defaultProps} />);
      const select = screen.getByLabelText('Test Select');
      await user.selectOptions(select, '2');
      expect(defaultProps.onChange).toHaveBeenCalled();
      expect(select).toHaveValue('2');
    });

    it('displays error message', () => {
      render(<FormSelect {...defaultProps} error="Please select an option" />);
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });
  });

  describe('FormCheckbox', () => {
    const defaultProps = {
      label: 'Test Checkbox',
      name: 'test',
      onChange: vi.fn(),
      error: '',
    };

    it('renders correctly', () => {
      render(<FormCheckbox {...defaultProps} />);
      expect(screen.getByLabelText('Test Checkbox')).toBeInTheDocument();
    });

    it('handles checking and unchecking', async () => {
      render(<FormCheckbox {...defaultProps} />);
      const checkbox = screen.getByLabelText('Test Checkbox');
      await user.click(checkbox);
      expect(defaultProps.onChange).toHaveBeenCalled();
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('supports disabled state', () => {
      render(<FormCheckbox {...defaultProps} disabled />);
      expect(screen.getByLabelText('Test Checkbox')).toBeDisabled();
    });
  });

  describe('FormRadio', () => {
    const options = [
      { value: '1', label: 'Radio 1' },
      { value: '2', label: 'Radio 2' },
    ];
    const defaultProps = {
      label: 'Test Radio Group',
      name: 'test',
      options,
      onChange: vi.fn(),
      error: '',
    };

    it('renders radio group correctly', () => {
      render(<FormRadio {...defaultProps} />);
      options.forEach(option => {
        expect(screen.getByLabelText(option.label)).toBeInTheDocument();
      });
    });

    it('handles radio selection', async () => {
      render(<FormRadio {...defaultProps} />);
      const radio = screen.getByLabelText('Radio 1');
      await user.click(radio);
      expect(defaultProps.onChange).toHaveBeenCalled();
      expect(radio).toBeChecked();
    });

    it('only allows one selection at a time', async () => {
      render(<FormRadio {...defaultProps} />);
      const radio1 = screen.getByLabelText('Radio 1');
      const radio2 = screen.getByLabelText('Radio 2');

      await user.click(radio1);
      expect(radio1).toBeChecked();
      expect(radio2).not.toBeChecked();

      await user.click(radio2);
      expect(radio1).not.toBeChecked();
      expect(radio2).toBeChecked();
    });
  });

  describe('FormTextarea', () => {
    const defaultProps = {
      label: 'Test Textarea',
      name: 'test',
      onChange: vi.fn(),
      error: '',
    };

    it('renders correctly', () => {
      render(<FormTextarea {...defaultProps} />);
      expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument();
    });

    it('handles user input', async () => {
      render(<FormTextarea {...defaultProps} />);
      const textarea = screen.getByLabelText('Test Textarea');
      await user.type(textarea, 'test content');
      expect(defaultProps.onChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('test content');
    });

    it('supports resizing', () => {
      render(<FormTextarea {...defaultProps} rows={5} />);
      const textarea = screen.getByLabelText('Test Textarea');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('displays character count when maxLength is set', () => {
      render(<FormTextarea {...defaultProps} maxLength={100} />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });
  });

  // Accessibility tests for all form components
  describe('Accessibility', () => {
    it('FormInput meets accessibility standards', async () => {
      const { container } = render(
        <FormInput label="Test Input" name="test" onChange={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FormSelect meets accessibility standards', async () => {
      const { container } = render(
        <FormSelect
          label="Test Select"
          name="test"
          options={[{ value: '1', label: 'Option 1' }]}
          onChange={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FormCheckbox meets accessibility standards', async () => {
      const { container } = render(
        <FormCheckbox label="Test Checkbox" name="test" onChange={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FormRadio meets accessibility standards', async () => {
      const { container } = render(
        <FormRadio
          label="Test Radio"
          name="test"
          options={[{ value: '1', label: 'Radio 1' }]}
          onChange={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FormTextarea meets accessibility standards', async () => {
      const { container } = render(
        <FormTextarea label="Test Textarea" name="test" onChange={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
