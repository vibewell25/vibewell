import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Web3PaymentForm } from '../web3-payment-form';
import { Web3WalletConnector } from '../web3-wallet-connector';
import { PaymentMethodSelector } from '../payment-method-selector';
import '@testing-library/jest-dom';

// The ethers.js and Web3Modal mocks are now in setupTests.ts

// Mock WalletConnect
jest.mock('@walletconnect/web3-provider', () => {
  return jest.fn();
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

// Mock fetch for exchange rates
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      'ethereum': { usd: 2500 },
      'matic-network': { usd: 1.25 },
      'usd-coin': { usd: 1 },
    }),
  })
);

describe('Web3WalletConnector', () => {
  it('renders connect wallet button', () => {
    render(<Web3WalletConnector />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders custom button text when provided', () => {
    render(<Web3WalletConnector buttonText="Connect Crypto Wallet" />);
    expect(screen.getByText('Connect Crypto Wallet')).toBeInTheDocument();
  });
});

describe('Web3PaymentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with cryptocurrency options', async () => {
    await act(async () => {
      render(<Web3PaymentForm amount={100} />);
    });
    
    // Wait for exchange rates to load
    await waitFor(() => {
      expect(screen.getByText('Select Cryptocurrency')).toBeInTheDocument();
    });
    
    // Check for cryptocurrency options
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('USD Coin (Ethereum)')).toBeInTheDocument();
  });

  it('calculates crypto amount based on exchange rates', async () => {
    await act(async () => {
      render(<Web3PaymentForm amount={100} />);
    });
    
    // Wait for exchange rates to load
    await waitFor(() => {
      expect(screen.getByText(/Continue to Payment/i)).toBeInTheDocument();
    });
    
    // ETH amount calculation (100 USD / 2500 USD per ETH = 0.04 ETH)
    expect(screen.getByText(/≈ 0.04/i)).toBeInTheDocument();
  });

  it('transitions to payment step when clicking continue', async () => {
    await act(async () => {
      render(<Web3PaymentForm amount={100} />);
    });
    
    // Wait for exchange rates to load
    await waitFor(() => {
      expect(screen.getByText(/Continue to Payment/i)).toBeInTheDocument();
    });
    
    // Click continue button
    await act(async () => {
      fireEvent.click(screen.getByText(/Continue to Payment/i));
    });
    
    // Check if payment step is shown
    expect(screen.getByText(/Make Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect Wallet to Pay/i)).toBeInTheDocument();
  });
});

describe('PaymentMethodSelector', () => {
  it('renders available payment methods', async () => {
    await act(async () => {
      render(<PaymentMethodSelector amount={100} />);
    });
    
    expect(screen.getByText('Credit or Debit Card')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
  });

  it('filters payment methods based on availableMethods prop', async () => {
    await act(async () => {
      render(<PaymentMethodSelector amount={100} availableMethods={['card', 'crypto']} />);
    });
    
    expect(screen.getByText('Credit or Debit Card')).toBeInTheDocument();
    expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    expect(screen.queryByText('Bank Transfer')).not.toBeInTheDocument();
  });

  it('switches payment form when selecting different method', async () => {
    await act(async () => {
      render(<PaymentMethodSelector amount={100} />);
    });
    
    // Default is card payment
    expect(screen.queryByText('Select Cryptocurrency')).not.toBeInTheDocument();
    
    // Click on crypto payment option
    await act(async () => {
      fireEvent.click(screen.getByText('Cryptocurrency'));
    });
    
    // Wait for crypto payment form to render
    await waitFor(() => {
      expect(screen.getByText('Select Cryptocurrency')).toBeInTheDocument();
    });
  });
}); 