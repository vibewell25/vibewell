/* eslint-disable */import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TwoFactorAuth } from '@/components/profile/two-factor-auth';
import { toast } from '@/components/ui/use-toast';

// Mock the toast component
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

describe('TwoFactorAuth Component', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
  }));

  it('renders the component correctly', () => {
    render(<TwoFactorAuth />);

    // Check if the main title is present
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();

    // Check if the description is present
    expect(screen.getByText(/Add an extra layer of security/)).toBeInTheDocument();

    // Check if the methods are displayed
    expect(screen.getByText('Authenticator App')).toBeInTheDocument();
    expect(screen.getByText('SMS Verification')).toBeInTheDocument();
  }));

  it('shows QR code when enabling authenticator app', async () => {
    render(<TwoFactorAuth />);

    // Find and click the enable button for authenticator app
    const enableButton = screen.getAllByRole('button', { name: /Enable/i })[0];
    fireEvent.click(enableButton);

    // Check if QR code section appears
    await waitFor(() => {
      expect(screen.getByText('Scan this QR code')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
    }));

  it('handles verification code input', async () => {
    render(<TwoFactorAuth />);

    // Enable authenticator app
    const enableButton = screen.getAllByRole('button', { name: /Enable/i })[0];
    fireEvent.click(enableButton);

    // Enter verification code
    const codeInput = screen.getByLabelText('Verification code');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    expect(codeInput).toHaveValue('123456');
  });

  it('shows success toast when verification is successful', async () => {
    render(<TwoFactorAuth />);

    // Enable authenticator app
    const enableButton = screen.getAllByRole('button', { name: /Enable/i })[0];
    fireEvent.click(enableButton);

    // Enter verification code
    const codeInput = screen.getByLabelText('Verification code');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);

    // Check if toast was called with success message
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '2FA Enabled',
          description: expect.stringContaining('enabled successfully'),
        }),

    }));

  it('displays phone number input when enabling SMS verification', async () => {
    render(<TwoFactorAuth />);

    // Find and click the enable button for SMS verification
    const enableButtons = screen.getAllByRole('button', { name: /Enable/i });
    fireEvent.click(enableButtons[1]); // SMS is the second method

    // Check for toast with SMS verification message
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'SMS Verification',
        description: expect.stringContaining('phone number'),
      }),

  });

  it('allows disabling of enabled methods', async () => {
    // Mock a scenario where authenticator is already enabled
    const { rerender } = render(<TwoFactorAuth />);

    // Enable the authenticator
    const enableButton = screen.getAllByRole('button', { name: /Enable/i })[0];
    fireEvent.click(enableButton);

    // Enter code and verify
    const codeInput = screen.getByLabelText('Verification code');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);

    // Force rerender to simulate the enabled state
    rerender(<TwoFactorAuth />);

    // Now we should see a Disable button
    const disableButton = screen.getByRole('button', { name: /Disable/i });
    fireEvent.click(disableButton);

    // Check if toast was called with disabled message
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '2FA Disabled',
        description: expect.stringContaining('has been disabled'),
      }),

  }));
