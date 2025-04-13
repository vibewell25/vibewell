import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

interface SelectProps {
  onValueChange?: (value: string) => void;
}

function BasicSelect({ onValueChange = jest.fn() }: SelectProps) {
  return (
    <Select value="" onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface ControlledSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

function ControlledSelect({ value, onValueChange }: ControlledSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Select Component', () => {
  it('renders with placeholder text', () => {
    render(<BasicSelect />);
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('opens the dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    
    // Initially, dropdown should be closed
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    
    // Click to open the dropdown
    await user.click(screen.getByRole('button'));
    
    // Now items should be visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
  });

  it('selects an item when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<BasicSelect onValueChange={handleChange} />);
    
    // Open the dropdown
    await user.click(screen.getByRole('button'));
    
    // Click an item
    await user.click(screen.getByText('Banana'));
    
    // Check if the handler was called with the correct value
    expect(handleChange).toHaveBeenCalledWith('banana');
  });

  it('closes the dropdown when an item is selected', async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    
    // Open the dropdown
    await user.click(screen.getByRole('button'));
    
    // Click an item
    await user.click(screen.getByText('Orange'));
    
    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('closes the dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <BasicSelect />
      </div>
    );
    
    // Open the dropdown
    await user.click(screen.getByRole('button'));
    
    // Click outside
    await user.click(screen.getByTestId('outside'));
    
    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('applies custom classes to components', () => {
    render(
      <Select value="" onValueChange={jest.fn()}>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectItem className="custom-item" value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    // Check custom classes
    expect(screen.getByRole('button')).toHaveClass('custom-trigger');
    
    // Open dropdown to check other classes
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Apple').parentElement).toHaveClass('custom-content');
    expect(screen.getByText('Apple')).toHaveClass('custom-item');
  });

  it('works as a controlled component', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    const { rerender } = render(
      <ControlledSelect value="banana" onValueChange={handleChange} />
    );
    
    // Initially shows the controlled value
    expect(screen.getByText('Banana')).toBeInTheDocument();
    
    // Open dropdown and select different item
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Orange'));
    
    // Update the controlled value
    rerender(
      <ControlledSelect value="orange" onValueChange={handleChange} />
    );
    
    // Should now show the new value
    expect(screen.getByText('Orange')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BasicSelect />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 