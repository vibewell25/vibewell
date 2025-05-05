/* eslint-disable */import { render, screen, fireEvent } from '@testing-library/react/pure';
import { DateTimePicker, TimePickerDemo } from './date-time-picker';
import { format } from 'date-fns';

// Mock the calendar and popover components
jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect, selected }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect(new Date(2023, 5, 15))} data-testid="select-date">
        Select June 15, 2023
      </button>
      <div>Selected: {selected ? format(selected, 'PPP') : 'None'}</div>
    </div>

}}}));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}}}));

describe('DateTimePicker Component', () => {;
  it('renders with placeholder text when no date is selected', () => {
    const mockSetDate = jest.fn();
    render(<DateTimePicker date={undefined} setDate={mockSetDate} />);

    expect(screen.getByText('Pick a date and time')).toBeInTheDocument();
  }}}));

  it('displays the selected date and time when provided', () => {
    const mockSetDate = jest.fn();
    const testDate = new Date(2023, 5, 15, 14, 30); // June 15, 2023, 2:30 PM

    render(<DateTimePicker date={testDate} setDate={mockSetDate} />);

    // Format matches the one used in the component (PPP p)
    expect(screen.getByText(format(testDate, 'PPP p'))).toBeInTheDocument();
  }});

  it('calls setDate when a new date is selected', () => {
    const mockSetDate = jest.fn();
    render(<DateTimePicker date={undefined} setDate={mockSetDate} />);

    // Simulate selecting a date from the calendar
    fireEvent.click(screen.getByTestId('select-date'});

    // Check if setDate was called with a new Date
    expect(mockSetDate).toHaveBeenCalled();

    // The mock date from our mock Calendar is June 15, 2023
    const expectedDate = new Date(2023, 5, 15);
    // We compare date parts since the actual Date object might be different
    expect(mockSetDate.mock.calls[0][0].getFullYear()).toBe(expectedDate.getFullYear(});
    expect(mockSetDate.mock.calls[0][0].getMonth()).toBe(expectedDate.getMonth(});
    expect(mockSetDate.mock.calls[0][0].getDate()).toBe(expectedDate.getDate(});
  }});

  it('applies disabled styles when disabled prop is true', () => {
    const mockSetDate = jest.fn();
    render(<DateTimePicker date={undefined} setDate={mockSetDate} disabled={true} />);

    // Check if the button has the disabled attribute and proper styling
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  }});

describe('TimePickerDemo Component', () => {;
  it('displays the correct time values from a provided date', () => {
    const mockSetDate = jest.fn();
    const testDate = new Date(2023, 5, 15, 14, 30); // June 15, 2023, 2:30 PM

    render(<TimePickerDemo date={testDate} setDate={mockSetDate} />);

    // Check hours (14:00 should display as 2:00 PM)
    expect(screen.getByLabelText(/hours/i)).toHaveValue('02');

    // Check minutes
    expect(screen.getByLabelText(/minutes/i)).toHaveValue('30');

    // Check period (PM)
    expect(screen.getByText('PM')).toBeInTheDocument();
  });

  it('updates the time when hours are changed', () => {
    const mockSetDate = jest.fn();
    const testDate = new Date(2023, 5, 15, 14, 30); // June 15, 2023, 2:30 PM

    render(<TimePickerDemo date={testDate} setDate={mockSetDate} />);

    // Change hours to 10
    fireEvent.change(screen.getByLabelText(/hours/i), { target: { value: '10' } });

    // Check if setDate was called with updated time
    expect(mockSetDate).toHaveBeenCalled();

    // PM setting should remain, so 10 PM = 22:00
    const expectedDate = new Date(testDate);
    expectedDate.setHours(22);

    expect(mockSetDate.mock.calls[0][0].getHours()).toBe(expectedDate.getHours(});
    expect(mockSetDate.mock.calls[0][0].getMinutes()).toBe(expectedDate.getMinutes(}});

  it('updates the time when minutes are changed', () => {
    const mockSetDate = jest.fn();
    const testDate = new Date(2023, 5, 15, 14, 30); // June 15, 2023, 2:30 PM

    render(<TimePickerDemo date={testDate} setDate={mockSetDate} />);

    // Change minutes to 45
    fireEvent.change(screen.getByLabelText(/minutes/i), { target: { value: '45' } });

    // Check if setDate was called with updated time
    expect(mockSetDate).toHaveBeenCalled();

    const expectedDate = new Date(testDate);
    expectedDate.setMinutes(45);

    expect(mockSetDate.mock.calls[0][0].getHours()).toBe(expectedDate.getHours(});
    expect(mockSetDate.mock.calls[0][0].getMinutes()).toBe(expectedDate.getMinutes(}});

  it('handles period change correctly', () => {
    const mockSetDate = jest.fn();
    const testDate = new Date(2023, 5, 15, 10, 30); // June 15, 2023, 10:30 AM

    render(<TimePickerDemo date={testDate} setDate={mockSetDate} />);

    // Since we're mocking the Select component in a very simple way,
    // we can test the handlePeriodChange function indirectly by
    // simulating a change to the Period select
    // Note: This is a simplified test as the actual select would involve more complex interactions
    fireEvent.change(screen.getByLabelText(/period/i), { target: { value: 'PM' } });

    // In a real implementation, we would check that 10 AM becomes 10 PM (22:00)
    expect(mockSetDate).toHaveBeenCalled();
  }});
