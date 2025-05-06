/* eslint-disable */import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from '../OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OnboardingService } from '@/services/onboarding-service';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));
jest.mock('@/services/onboarding-service');

describe('OnboardingFlow Component', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    }));
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (OnboardingService.saveUserPreferences as jest.Mock).mockResolvedValue({ success: true }));
    (OnboardingService.completeOnboarding as jest.Mock).mockResolvedValue({ success: true }));

  it('should render welcome screen as first step', () => {
    render(<OnboardingFlow />);
    
    expect(screen.getByText(/Welcome to VibeWell/i)).toBeInTheDocument();
    expect(screen.getByText(/Let's get to know you better/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  }));

  it('should navigate through onboarding steps', async () => {
    render(<OnboardingFlow />);
    
    // Step 1: Welcome
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    
    // Step 2: Profile information
    await waitFor(() => {
      expect(screen.getByText(/Tell us about yourself/i)).toBeInTheDocument();
    });
    
    // Fill out profile form
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: 'Updated Name' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // Step 3: Preferences
    await waitFor(() => {
      expect(screen.getByText(/Your preferences/i)).toBeInTheDocument();
    });
    
    // Select preferences
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[2]);
    
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // Step 4: Notification settings
    await waitFor(() => {
      expect(screen.getByText(/Notification preferences/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Allow Notifications/i }));
    
    // Step 5: Completion
    await waitFor(() => {
      expect(screen.getByText(/All set!/i)).toBeInTheDocument();
    });
    
    // Should have saved preferences
    expect(OnboardingService.saveUserPreferences).toHaveBeenCalled();
  });

  it('should handle form validation', async () => {
    render(<OnboardingFlow />);
    
    // Move to profile step
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    
    // Try to continue without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });
    
    // Fill required field
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: 'Test User' }
    });
    
    // Should be able to continue now
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // Should move to next step
    await waitFor(() => {
      expect(screen.getByText(/Your preferences/i)).toBeInTheDocument();
    }));

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (OnboardingService.saveUserPreferences as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to save preferences')

    render(<OnboardingFlow />);
    
    // Go through the steps
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    
    // Fill profile information
    await waitFor(() => {
      expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: 'Test User' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // Select preferences
    await waitFor(() => {
      expect(screen.getByText(/Your preferences/i)).toBeInTheDocument();
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
    
    // Should have retry button
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('should redirect already onboarded users', () => {
    // Mock user as already onboarded
    (useAuth as jest.Mock).mockReturnValue({
      user: { ...mockUser, onboardingCompleted: true },
      isAuthenticated: true,
      isLoading: false
    });
    
    render(<OnboardingFlow />);
    
    // Should redirect to dashboard
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should complete onboarding and redirect on finish', async () => {
    render(<OnboardingFlow />);
    
    // Go through all steps
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    
    // Profile step
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Your Name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });
    
    // Preferences step
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });
    
    // Notifications step
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Allow Notifications/i }));
    });
    
    // Completion step
    await waitFor(() => {
      expect(screen.getByText(/All set!/i)).toBeInTheDocument();
    });
    
    // Click finish button
    fireEvent.click(screen.getByRole('button', { name: /Go to Dashboard/i }));
    
    // Should complete onboarding and redirect
    expect(OnboardingService.completeOnboarding).toHaveBeenCalledWith(mockUser.id);
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle unauthenticated users', () => {
    // Mock user as not authenticated
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    render(<OnboardingFlow />);
    
    // Should redirect to login
    expect(mockRouter.replace).toHaveBeenCalledWith('/login?returnTo=/onboarding');
  })); 