import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BookingForm } from '@/components/booking/booking-form';
import { useAuth } from '@/hooks/use-unified-auth';

// Mock authentication context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 'booking-123', success: true }),
  })
) as jest.Mock;

describe('BookingForm Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated user
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      loading: false,
    }));
  });

  it('sanitizes user input to prevent XSS attacks', async () => {
    render(<BookingForm serviceId="service-123" />);

    // Find form inputs
    const nameInput = screen.getByLabelText(/name/i);
    const notesInput = screen.getByLabelText(/notes/i);

    // Try to inject script tag in inputs
    fireEvent.change(nameInput, { target: { value: '<script>alert("XSS")</script>Test User' } });
    fireEvent.change(notesInput, { target: { value: '<img src="x" onerror="alert(\'XSS\')" />' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /book/i }));

    // Check that the data sent to the server was sanitized
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Validate that script tags are sanitized/escaped
      expect(requestBody.name).not.toContain('<script>');
      expect(requestBody.notes).not.toContain('onerror=');
    });
  });

  it('validates required fields before submission', async () => {
    render(<BookingForm serviceId="service-123" />);

    // Leave required fields empty

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /book/i }));

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();

      // Ensure API was not called
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it('verifies CSRF token is included in the request', async () => {
    // Mock CSRF token
    document.head.innerHTML = `<meta name="csrf-token" content="test-csrf-token">`;

    render(<BookingForm serviceId="service-123" />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2023-12-01' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '10:00' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /book/i }));

    // Check that CSRF token is included in the request
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      const fetchCall = (fetch as jest.Mock).mock.calls[0];

      // Check headers for CSRF token
      expect(fetchCall[1].headers).toHaveProperty('X-CSRF-Token');
      expect(fetchCall[1].headers['X-CSRF-Token']).toBe('test-csrf-token');
    });
  });

  it('ensures sensitive data like payment info is not logged', async () => {
    // Mock console.log to capture logging
    const originalConsoleLog = console.log;
    const logMock = jest.fn();
    console.log = logMock;

    render(<BookingForm serviceId="service-123" paymentRequired={true} />);

    // Fill in required fields including payment info
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2023-12-01' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '10:00' } });

    // Fill in credit card info (assuming these fields exist in payment-required mode)
    if (screen.getByLabelText(/card number/i)) {
      fireEvent.change(screen.getByLabelText(/card number/i), {
        target: { value: '4111111111111111' },
      });
      fireEvent.change(screen.getByLabelText(/cvv/i), { target: { value: '123' } });
      fireEvent.change(screen.getByLabelText(/expiration/i), { target: { value: '12/25' } });
    }

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /book/i }));

    // Check if sensitive data was logged
    await waitFor(() => {
      for (const call of logMock.mock.calls) {
        const logString = JSON.stringify(call).toLowerCase();
        expect(logString).not.toContain('4111111111111111');
        expect(logString).not.toContain('cvv');
      }
    });

    // Restore console.log
    console.log = originalConsoleLog;
  });

  it('handles booking with proper access control', async () => {
    // Test unauthorized access
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: null,
      loading: false,
    }));

    render(<BookingForm serviceId="service-123" />);

    // Check that unauthorized message is shown or redirect happens
    expect(screen.getByText(/please login to book/i)).toBeInTheDocument();

    // Submit should be disabled or not work
    if (screen.queryByRole('button', { name: /book/i })) {
      fireEvent.click(screen.getByRole('button', { name: /book/i }));
      expect(fetch).not.toHaveBeenCalled();
    }
  });
});
