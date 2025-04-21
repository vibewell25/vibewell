import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingPage } from '@/pages/booking';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockBookingData, mockProviderData } from '../mocks/booking-data';
import { mockStripe } from '../mocks/stripe';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/booking',
  }),
}));

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: () => mockStripe,
}));

describe('Booking Flow Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <SessionProvider session={{ user: { id: '123', email: 'test@example.com' } }}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </SessionProvider>
    );
  };

  beforeEach(() => {
    // Reset mocks
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('completes a successful booking flow', async () => {
    // Mock API responses
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProviderData),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingData),
        })
      );

    renderWithProviders(<BookingPage />);

    // Step 1: Select a service
    await waitFor(() => {
      expect(screen.getByText('Select a Service')).toBeInTheDocument();
    });

    const serviceCard = screen.getByTestId('service-card-1');
    await userEvent.click(serviceCard);
    expect(serviceCard).toHaveClass('selected');

    // Step 2: Select a provider
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Select a Provider')).toBeInTheDocument();
    });

    const providerCard = screen.getByTestId('provider-card-1');
    await userEvent.click(providerCard);
    expect(providerCard).toHaveClass('selected');

    // Step 3: Select date and time
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Select Date & Time')).toBeInTheDocument();
    });

    const dateCell = screen.getByTestId('date-cell-2023-12-25');
    await userEvent.click(dateCell);
    expect(dateCell).toHaveClass('selected');

    const timeSlot = screen.getByTestId('time-slot-10-00');
    await userEvent.click(timeSlot);
    expect(timeSlot).toHaveClass('selected');

    // Step 4: Enter contact details
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Contact Details')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText('Phone Number'), '1234567890');
    await userEvent.type(screen.getByLabelText('Special Requests'), 'Test request');

    // Step 5: Review booking
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Review Booking')).toBeInTheDocument();
    });

    // Verify booking details
    expect(screen.getByText(mockBookingData.service.name)).toBeInTheDocument();
    expect(screen.getByText(mockBookingData.provider.name)).toBeInTheDocument();
    expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();

    // Step 6: Payment
    const confirmButton = screen.getByText('Confirm & Pay');
    await userEvent.click(confirmButton);

    // Verify Stripe was called
    await waitFor(() => {
      expect(mockStripe.redirectToCheckout).toHaveBeenCalled();
    });

    // Verify booking was created
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bookings'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      })
    );
  });

  it('handles validation errors appropriately', async () => {
    renderWithProviders(<BookingPage />);

    // Try to proceed without selecting a service
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    expect(screen.getByText('Please select a service')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('API Error')));

    renderWithProviders(<BookingPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading services')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    await userEvent.click(retryButton);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('preserves form data between steps', async () => {
    renderWithProviders(<BookingPage />);

    // Select service
    const serviceCard = screen.getByTestId('service-card-1');
    await userEvent.click(serviceCard);

    // Go to next step and back
    await userEvent.click(screen.getByText('Next'));
    await userEvent.click(screen.getByText('Back'));

    // Verify service selection is preserved
    expect(serviceCard).toHaveClass('selected');
  });
});
