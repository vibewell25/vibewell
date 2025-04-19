import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BusinessProfileWizard } from '../business-profile-wizard';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}

// Mock the child form components
jest.mock('../forms/location-form', () => ({
  LocationForm: ({ form }: any) => (
    <div data-testid="location-form">
      Location Form
      <button data-testid="location-complete" onClick={() => form.setValue('address', '123 Test St')}>
        Set Address
      </button>
    </div>
  ),
}));

jest.mock('../forms/service-form', () => ({
  ServiceForm: () => <div data-testid="service-form">Service Form</div>,
}));

jest.mock('../forms/photo-upload-form', () => ({
  PhotoUploadForm: () => <div data-testid="photo-form">Photo Upload Form</div>,
}));

jest.mock('../forms/payment-settings-form', () => ({
  PaymentSettingsForm: () => <div data-testid="payment-form">Payment Settings Form</div>,
}));

jest.mock('../forms/policies-form', () => ({
  PoliciesForm: () => <div data-testid="policies-form">Policies Form</div>,
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe('BusinessProfileWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step (location) by default', () => {
    render(<BusinessProfileWizard />);
    
    expect(screen.getByTestId('location-form')).toBeInTheDocument();
    expect(screen.queryByTestId('service-form')).not.toBeInTheDocument();
  });

  it('navigates to the next step when Next button is clicked', async () => {
    render(<BusinessProfileWizard />);
    
    // Set valid address to allow navigation
    await act(async () => {
      fireEvent.click(screen.getByTestId('location-complete'));
      fireEvent.click(screen.getByText('Next Step'));
    });
    
    // Should now be on service form
    expect(screen.getByTestId('service-form')).toBeInTheDocument();
    expect(screen.queryByTestId('location-form')).not.toBeInTheDocument();
  });

  it('navigates to the previous step when Back button is clicked', async () => {
    render(<BusinessProfileWizard />);
    
    // Set valid address to allow navigation
    await act(async () => {
      fireEvent.click(screen.getByTestId('location-complete'));
    });
    
    // Navigate to second step
    await act(async () => {
      fireEvent.click(screen.getByText('Next Step'));
    });
    
    // Should now be on service form
    expect(screen.getByTestId('service-form')).toBeInTheDocument();
    
    // Go back to the first step
    await act(async () => {
      fireEvent.click(screen.getByText('Back'));
    });
    
    // Should now be on location form again
    expect(screen.getByTestId('location-form')).toBeInTheDocument();
  });

  it('shows all steps in the progress indicator', () => {
    render(<BusinessProfileWizard />);
    
    // Check for all step labels
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
  });

  it('changes the button text on the final step', async () => {
    render(<BusinessProfileWizard />);
    
    // Navigate through all steps
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('location-complete'));
        fireEvent.click(screen.getByText('Next Step'));
      });
    }
    
    // Should be on the policies form (last step)
    expect(screen.getByTestId('policies-form')).toBeInTheDocument();
    
    // The button should say "Save Profile" instead of "Next"
    expect(screen.getByText('Save Profile')).toBeInTheDocument();
    expect(screen.queryByText('Next Step')).not.toBeInTheDocument();
  });

  it('attempts to submit the form on the last step', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<BusinessProfileWizard />);
    
    // Navigate through all steps
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('location-complete'));
        fireEvent.click(screen.getByText('Next Step'));
      });
    }
    
    // Should be on the policies form (last step)
    expect(screen.getByTestId('policies-form')).toBeInTheDocument();
    
    // Click save button
    await act(async () => {
      fireEvent.click(screen.getByText('Save Profile'));
    });
    
    // Check if form submission logic is called
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Form submitted:", expect.anything());
    });
    
    consoleSpy.mockRestore();
  });
}); 