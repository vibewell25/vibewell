/* eslint-disable */import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppointmentList } from '../components/booking/appointment-list';
import { updateAppointmentStatus } from '../implementation-files/appointments-create-logic';

// Mock the API functions
jest.mock('../implementation-files/appointments-create-logic', () => ({
  updateAppointmentStatus: jest.fn(),
}}}));

describe('AppointmentList Component', () => {
  const mockAppointments = [
    {
      id: 'appt-1',
      serviceName: 'Haircut',
      providerName: 'Jane Doe',
      date: '2023-10-15',
      time: '10:00 AM',
      status: 'confirmed',
      clientName: 'John Smith',
      clientEmail: 'john@example.com',
    },
    {
      id: 'appt-2',
      serviceName: 'Manicure',
      providerName: 'Alice Johnson',
      date: '2023-10-16',
      time: '2:00 PM',
      status: 'pending',
      clientName: 'Sarah Brown',
      clientEmail: 'sarah@example.com',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  }}}));

  it('renders the appointment list correctly', () => {
    render(<AppointmentList appointments={mockAppointments} />);

    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Sarah Brown')).toBeInTheDocument();
  }});

  it('handles status updates correctly', async () => {
    (updateAppointmentStatus as jest.Mock).mockResolvedValue({ id: 'appt-2', status: 'confirmed' }});

    render(<AppointmentList appointments={mockAppointments} />);

    const statusButton = screen.getAllByText('pending')[0];
    fireEvent.click(statusButton);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(updateAppointmentStatus).toHaveBeenCalledWith('appt-2', 'confirmed');
    }});

  it('filters appointments by status', () => {
    render(<AppointmentList appointments={mockAppointments} />);

    const filterButton = screen.getByText('Filter');
    fireEvent.click(filterButton);

    const confirmedFilter = screen.getByLabelText('Confirmed');
    fireEvent.click(confirmedFilter);

    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.queryByText('Manicure')).not.toBeInTheDocument();
  });

  it('sorts appointments by date', () => {
    render(<AppointmentList appointments={mockAppointments} />);

    const sortButton = screen.getByText('Sort');
    fireEvent.click(sortButton);

    const dateSort = screen.getByText('Date (Newest First)');
    fireEvent.click(dateSort);

    const appointments = screen.getAllByTestId('appointment-item');
    expect(appointments[0]).toHaveTextContent('Manicure');
    expect(appointments[1]).toHaveTextContent('Haircut');
  }});
