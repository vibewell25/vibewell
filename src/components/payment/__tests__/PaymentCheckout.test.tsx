/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PaymentCheckout } from '../PaymentCheckout';

// Mock the useRouter hook
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the PaymentFormWrapper component
vi.mock('../PaymentForm', () => ({
  PaymentFormWrapper: ({ onPaymentSuccess, onPaymentError }) => (
    <div data-testid="payment-form-wrapper">
      <button data-testid="simulate-success" onClick={() => onPaymentSuccess({ id: 'pi_12345' })}>
        Simulate Success
      </button>
      <button
        data-testid="simulate-error"
        onClick={() => onPaymentError({ message: 'Test error' })}
      >
        Simulate Error
      </button>
    </div>
  ),
}));

// Mock the fetch function
global.fetch = vi.fn();

describe('PaymentCheckout', () => {
  const defaultProps = {
    amount: 99.99,
    currency: 'USD',
    description: 'Test Payment',
    metadata: { itemName: 'Test Item' },
    onPaymentSuccess: vi.fn(),
    onPaymentError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: 'cs_test_secret', id: 'pi_12345' }),
    });
  });

  it('renders the payment checkout form with correct amount and description', () => {
    render(<PaymentCheckout {...defaultProps} />);

    expect(screen.getByText('Complete Your Payment')).toBeInTheDocument();
    expect(screen.getByText('Test Payment')).toBeInTheDocument();
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('calls the API to create a payment intent when proceed button is clicked', async () => {
    render(<PaymentCheckout {...defaultProps} />);

    // Find and click the "Proceed to Payment" button
    const proceedButton = screen.getByText('Proceed to Payment');
    fireEvent.click(proceedButton);

    // Verify that fetch was called with the correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 99.99,
          currency: 'usd',
          description: 'Test Payment',
          metadata: { itemName: 'Test Item' },
        }),
      });
    });
  });

  it('displays the payment form when client secret is received', async () => {
    render(<PaymentCheckout {...defaultProps} />);

    // Find and click the "Proceed to Payment" button
    const proceedButton = screen.getByText('Proceed to Payment');
    fireEvent.click(proceedButton);

    // Wait for the payment form to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('payment-form-wrapper')).toBeInTheDocument();
    });
  });

  it('calls onPaymentSuccess when payment is successful', async () => {
    render(<PaymentCheckout {...defaultProps} />);

    // Find and click the "Proceed to Payment" button
    const proceedButton = screen.getByText('Proceed to Payment');
    fireEvent.click(proceedButton);

    // Wait for the payment form to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('payment-form-wrapper')).toBeInTheDocument();
    });

    // Simulate a successful payment
    const successButton = screen.getByTestId('simulate-success');
    fireEvent.click(successButton);

    // Verify that onPaymentSuccess was called
    expect(defaultProps.onPaymentSuccess).toHaveBeenCalledWith('pi_12345');
  });

  it('calls onPaymentError when payment fails', async () => {
    render(<PaymentCheckout {...defaultProps} />);

    // Find and click the "Proceed to Payment" button
    const proceedButton = screen.getByText('Proceed to Payment');
    fireEvent.click(proceedButton);

    // Wait for the payment form to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('payment-form-wrapper')).toBeInTheDocument();
    });

    // Simulate a payment error
    const errorButton = screen.getByTestId('simulate-error');
    fireEvent.click(errorButton);

    // Verify that onPaymentError was called
    expect(defaultProps.onPaymentError).toHaveBeenCalledWith({ message: 'Test error' });
  });

  it('shows an error message when the API call fails', async () => {
    // Mock a failed API response
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Payment gateway error' }),
    });

    render(<PaymentCheckout {...defaultProps} />);

    // Find and click the "Proceed to Payment" button
    const proceedButton = screen.getByText('Proceed to Payment');
    fireEvent.click(proceedButton);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Payment gateway error')).toBeInTheDocument();
    });
  });
});
