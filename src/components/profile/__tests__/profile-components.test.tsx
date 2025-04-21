import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { ProfileCard, ProfileEditor, SettingsPanel } from '../';

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatar.jpg',
  bio: 'Test bio',
  location: 'New York',
  role: 'Instructor',
  specialties: ['Yoga', 'Meditation'],
  experience: '5 years',
};

describe('Profile Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProfileCard', () => {
    const defaultProps = {
      user: mockUser,
      onEdit: vi.fn(),
    };

    it('renders user information correctly', () => {
      render(<ProfileCard {...defaultProps} />);

      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
      expect(screen.getByText(mockUser.location)).toBeInTheDocument();
      expect(screen.getByText(mockUser.role)).toBeInTheDocument();
      mockUser.specialties.forEach(specialty => {
        expect(screen.getByText(specialty)).toBeInTheDocument();
      });
    });

    it('displays user avatar', () => {
      render(<ProfileCard {...defaultProps} />);
      const avatar = screen.getByAltText(`${mockUser.name}'s avatar`);
      expect(avatar).toHaveAttribute('src', mockUser.avatar);
    });

    it('handles edit button click', async () => {
      render(<ProfileCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /edit profile/i }));
      expect(defaultProps.onEdit).toHaveBeenCalled();
    });

    it('displays verified badge when user is verified', () => {
      render(<ProfileCard {...defaultProps} user={{ ...mockUser, verified: true }} />);
      expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    });
  });

  describe('ProfileEditor', () => {
    const defaultProps = {
      user: mockUser,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    };

    it('renders form with user data', () => {
      render(<ProfileEditor {...defaultProps} />);

      expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name);
      expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
      expect(screen.getByLabelText(/bio/i)).toHaveValue(mockUser.bio);
      expect(screen.getByLabelText(/location/i)).toHaveValue(mockUser.location);
    });

    it('handles form submission with valid data', async () => {
      render(<ProfileEditor {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      const bioInput = screen.getByLabelText(/bio/i);
      await user.clear(bioInput);
      await user.type(bioInput, 'New Bio');

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          bio: 'New Bio',
        })
      );
    });

    it('validates required fields', async () => {
      render(<ProfileEditor {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('handles avatar upload', async () => {
      render(<ProfileEditor {...defaultProps} />);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = screen.getByLabelText(/change avatar/i);

      await user.upload(input, file);

      expect(input.files[0]).toBe(file);
      expect(screen.getByText(/test.png/i)).toBeInTheDocument();
    });

    it('handles cancel button click', async () => {
      render(<ProfileEditor {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('SettingsPanel', () => {
    const defaultProps = {
      settings: {
        notifications: true,
        emailUpdates: false,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
      },
      onSave: vi.fn(),
    };

    it('renders current settings', () => {
      render(<SettingsPanel {...defaultProps} />);

      expect(screen.getByLabelText(/notifications/i)).toBeChecked();
      expect(screen.getByLabelText(/email updates/i)).not.toBeChecked();
      expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
      expect(screen.getByLabelText(/language/i)).toHaveValue('en');
    });

    it('handles settings changes', async () => {
      render(<SettingsPanel {...defaultProps} />);

      await user.click(screen.getByLabelText(/notifications/i));
      await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
      await user.selectOptions(screen.getByLabelText(/language/i), 'es');

      await user.click(screen.getByRole('button', { name: /save settings/i }));

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: false,
          theme: 'dark',
          language: 'es',
        })
      );
    });

    it('validates timezone selection', async () => {
      render(<SettingsPanel {...defaultProps} />);

      await user.selectOptions(screen.getByLabelText(/timezone/i), 'invalid');
      await user.click(screen.getByRole('button', { name: /save settings/i }));

      expect(screen.getByText(/please select a valid timezone/i)).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('confirms before resetting to defaults', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
      render(<SettingsPanel {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }));

      expect(confirmSpy).toHaveBeenCalled();
      expect(defaultProps.onSave).toHaveBeenCalledWith({
        notifications: true,
        emailUpdates: true,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
      });

      confirmSpy.mockRestore();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('ProfileCard meets accessibility standards', async () => {
      const { container } = render(<ProfileCard user={mockUser} onEdit={() => {}} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ProfileEditor meets accessibility standards', async () => {
      const { container } = render(
        <ProfileEditor user={mockUser} onSave={() => {}} onCancel={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('SettingsPanel meets accessibility standards', async () => {
      const { container } = render(
        <SettingsPanel
          settings={{
            notifications: true,
            emailUpdates: false,
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
          }}
          onSave={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
