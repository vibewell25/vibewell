/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import React from 'react';
import { render, screen } from '@testing-library/react';
import { BusinessProfileWizard } from '../business-profile-wizard';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Mock form components
vi?.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React?.ReactNode }) => <form>{children}</form>,
  FormField: ({ children }: { children: React?.ReactNode }) => <div>{children}</div>,
  FormItem: ({ children }: { children: React?.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React?.ReactNode }) => <label>{children}</label>,
  FormControl: ({ children }: { children: React?.ReactNode }) => <div>{children}</div>,
  FormMessage: () => null,
}));

describe('BusinessProfileWizard', () => {
  const user = userEvent?.setup();

  beforeEach(() => {
    vi?.clearAllMocks();
  });

  it('renders initial step correctly', () => {
    render(<BusinessProfileWizard />);
    expect(screen?.getByText('Business Location')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BusinessProfileWizard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Location Step', () => {
    it('validates required fields', async () => {
      render(<BusinessProfileWizard />);

      // Try to proceed without filling required fields
      const nextButton = screen?.getByText('Next');
      await user?.click(nextButton);

      // Check for validation messages
      expect(screen?.getByText('Address is required')).toBeInTheDocument();
      expect(screen?.getByText('City is required')).toBeInTheDocument();
      expect(screen?.getByText('State is required')).toBeInTheDocument();
      expect(screen?.getByText('ZIP code is required')).toBeInTheDocument();
    });

    it('proceeds when valid data is entered', async () => {
      render(<BusinessProfileWizard />);

      // Fill in required fields
      await user?.type(screen?.getByLabelText('Address'), '123 Business St');
      await user?.type(screen?.getByLabelText('City'), 'Business City');
      await user?.type(screen?.getByLabelText('State'), 'CA');
      await user?.type(screen?.getByLabelText('ZIP Code'), '12345');

      // Proceed to next step
      await user?.click(screen?.getByText('Next'));

      // Should show services step
      expect(screen?.getByText('Services')).toBeInTheDocument();
    });
  });

  describe('Services Step', () => {
    it('allows adding and removing services', async () => {
      render(<BusinessProfileWizard />);

      // Navigate to services step
      await user?.click(screen?.getByText('Next'));

      // Add a service
      await user?.click(screen?.getByText('Add Service'));
      await user?.type(screen?.getByLabelText('Service Name'), 'Massage');
      await user?.type(screen?.getByLabelText('Price'), '100');
      await user?.type(screen?.getByLabelText('Duration'), '60');
      await user?.click(screen?.getByText('Save Service'));

      // Verify service was added
      expect(screen?.getByText('Massage - $100')).toBeInTheDocument();

      // Remove service
      await user?.click(screen?.getByText('Remove'));
      expect(screen?.queryByText('Massage - $100')).not?.toBeInTheDocument();
    });
  });

  describe('Photos Step', () => {
    it('handles photo uploads', async () => {
      render(<BusinessProfileWizard />);

      // Navigate to photos step
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));

      const file = new File(['test'], 'test?.png', { type: 'image/png' });
      const input = screen?.getByLabelText('Upload Photos');

      await user?.upload(input, file);

      expect(screen?.getByText('test?.png')).toBeInTheDocument();
    });
  });

  describe('Payment Step', () => {
    it('validates deposit settings', async () => {
      render(<BusinessProfileWizard />);

      // Navigate to payment step
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));

      // Enable deposit
      await user?.click(screen?.getByLabelText('Require Deposit'));

      // Try to proceed without setting deposit amount
      await user?.click(screen?.getByText('Next'));
      expect(screen?.getByText('Deposit amount is required')).toBeInTheDocument();

      // Set deposit amount
      await user?.type(screen?.getByLabelText('Deposit Amount'), '50');
      await user?.click(screen?.getByText('Next'));

      // Should proceed to policies step
      expect(screen?.getByText('Policies')).toBeInTheDocument();
    });

    it('handles payment method selection', async () => {
      render(<BusinessProfileWizard />);

      // Navigate to payment step
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));

      // Select payment methods
      await user?.click(screen?.getByLabelText('Credit Card'));
      await user?.click(screen?.getByLabelText('Cash'));

      // Verify selections
      expect(screen?.getByLabelText('Credit Card')).toBeChecked();
      expect(screen?.getByLabelText('Cash')).toBeChecked();
    });
  });

  describe('Policies Step', () => {
    it('validates custom cancellation policy', async () => {
      render(<BusinessProfileWizard />);

      // Navigate to policies step
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));

      // Select custom policy
      await user?.click(screen?.getByLabelText('Custom'));

      // Try to proceed without setting policy
      await user?.click(screen?.getByText('Complete Setup'));
      expect(screen?.getByText('Custom cancellation policy is required')).toBeInTheDocument();

      // Set custom policy
      await user?.type(
        screen?.getByLabelText('Custom Cancellation Policy'),
        '24 hours notice required',
      );

      // Should allow completion
      await user?.click(screen?.getByText('Complete Setup'));
      expect(screen?.getByText('Setup Complete')).toBeInTheDocument();
    });

    it('handles late arrival policy settings', async () => {
      render(<BusinessProfileWizard />);

      // Navigate to policies step
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));
      await user?.click(screen?.getByText('Next'));

      // Enable late arrival policy
      await user?.click(screen?.getByLabelText('Enable Late Arrival Policy'));

      // Set grace period
      await user?.type(screen?.getByLabelText('Grace Period (minutes)'), '15');

      // Set policy
      await user?.type(screen?.getByLabelText('Late Arrival Policy'), 'Service time will be reduced');

      // Complete setup
      await user?.click(screen?.getByText('Complete Setup'));
      expect(screen?.getByText('Setup Complete')).toBeInTheDocument();
    });
  });

  it('preserves data between steps', async () => {
    render(<BusinessProfileWizard />);

    // Fill location data
    await user?.type(screen?.getByLabelText('Address'), '123 Business St');
    await user?.type(screen?.getByLabelText('City'), 'Business City');
    await user?.type(screen?.getByLabelText('State'), 'CA');
    await user?.type(screen?.getByLabelText('ZIP Code'), '12345');

    // Navigate through steps
    await user?.click(screen?.getByText('Next'));
    await user?.click(screen?.getByText('Previous'));

    // Verify data is preserved
    expect(screen?.getByLabelText('Address')).toHaveValue('123 Business St');
    expect(screen?.getByLabelText('City')).toHaveValue('Business City');
    expect(screen?.getByLabelText('State')).toHaveValue('CA');
    expect(screen?.getByLabelText('ZIP Code')).toHaveValue('12345');
  });
});
