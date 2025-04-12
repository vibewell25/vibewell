import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProviderProfileForm } from '../profile-form';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id' }
        },
        error: null
      }),
      resend: jest.fn().mockResolvedValue({
        data: {},
        error: null
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'provider',
            email_verified: false,
            phone: '+1234567890',
            phone_verified: false,
            bio: 'Test bio',
            location: 'Test location',
            avatar_url: 'https://example.com/avatar.png',
            profile_visibility: 'public',
            show_email: false,
            show_phone: false,
            allow_tagging: true,
            receive_messages_from: 'anyone',
            notification_preferences: {
              email_notifications: true,
              sms_notifications: true,
              push_notifications: true,
              marketing_emails: false,
              booking_reminders: true,
              messages_notifications: true,
              promotional_notifications: false,
              newsletter: false
            },
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z'
          },
          error: null
        })
      })
    })
  }
}));

// Mock the toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('ProviderProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile form with personal info tab selected by default', async () => {
    await act(async () => {
      render(<ProviderProfileForm />);
    });
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });
    
    // Check that personal info tab is selected
    expect(screen.getByText('Email Verification')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('allows switching between tabs', async () => {
    await act(async () => {
      render(<ProviderProfileForm />);
    });
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });
    
    // Click on Privacy & Visibility tab
    await act(async () => {
      fireEvent.click(screen.getByText('Privacy & Visibility'));
    });
    
    // Check that privacy tab content is shown
    expect(screen.getByText('Profile Visibility')).toBeInTheDocument();
    
    // Click on Notifications tab
    await act(async () => {
      fireEvent.click(screen.getByText('Notifications'));
    });
    
    // Check that notifications tab content is shown
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
  });

  it('shows email verification status', async () => {
    await act(async () => {
      render(<ProviderProfileForm />);
    });
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Email Verification')).toBeInTheDocument();
    });
    
    // Check email verification status
    expect(screen.getByText('Email not verified. Please check your inbox for verification link.')).toBeInTheDocument();
    expect(screen.getByText('Resend Verification')).toBeInTheDocument();
  });

  it('allows sending email verification', async () => {
    await act(async () => {
      render(<ProviderProfileForm />);
    });
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Email Verification')).toBeInTheDocument();
    });
    
    // Click on resend verification button
    await act(async () => {
      fireEvent.click(screen.getByText('Resend Verification'));
    });
    
    // Check that supabase auth.resend was called
    const { supabase } = require('@/lib/supabase/client');
    expect(supabase.auth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'test@example.com'
    });
  });

  it('allows updating profile information', async () => {
    await act(async () => {
      render(<ProviderProfileForm />);
    });
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });
    
    // Update name field
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Updated Name' }
      });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Profile'));
    });
    
    // Check that supabase update was called with the right data
    const { supabase } = require('@/lib/supabase/client');
    expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'Updated Name'
    }));
  });

  it('allows changing notification preferences', async () => {
    await act(async () => {
      render(<ProviderProfileForm />);
    });
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });
    
    // Click on Notifications tab
    await act(async () => {
      fireEvent.click(screen.getByText('Notifications'));
    });
    
    // Find the Marketing Emails switch and click it
    const marketingEmailsSwitch = screen.getAllByRole('switch')[4]; // This is the marketing emails switch based on the order
    
    await act(async () => {
      fireEvent.click(marketingEmailsSwitch);
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Profile'));
    });
    
    // Check that supabase update was called with the right notification preferences
    const { supabase } = require('@/lib/supabase/client');
    expect(supabase.from().update).toHaveBeenCalledWith(
      expect.objectContaining({
        notification_preferences: expect.objectContaining({
          marketing_emails: true
        })
      })
    );
  });
}); 