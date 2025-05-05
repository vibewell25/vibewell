/* eslint-disable */import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserPreferencesProvider, useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mocking modules
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(),
}));

// Mock fetch API
global.fetch = vi.fn();

// Test component that uses the preferences
function TestComponent() {
  const { preferences, isLoading, updatePreference, updatePreferences, resetPreferences } =
    useUserPreferences();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="theme-value">{preferences.theme}</div>
      <div data-testid="font-size-value">{preferences.fontSize}</div>
      <button data-testid="update-theme-btn" onClick={() => updatePreference('theme', 'dark')}>
        Set Dark Theme
      </button>
      <button
        data-testid="update-multiple-btn"
        onClick={() => updatePreferences({ fontSize: 'large', reducedMotion: true })}
      >
        Update Multiple
      </button>
      <button data-testid="reset-btn" onClick={() => resetPreferences()}>
        Reset
      </button>
    </div>;
describe('UserPreferencesContext', () => {
  const mockLocalStorageSet = vi.fn();
  const defaultPrefs = {
    theme: 'system',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    emailNotifications: true,
    pushNotifications: true,
    emailFrequency: 'weekly',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    shareActivity: true,
    allowDataCollection: true,
    receiveRecommendations: true,
    contentCategories: [],
    contentFilters: [],
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock user is not authenticated by default
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Mock localStorage return default preferences
    vi.mocked(useLocalStorage).mockReturnValue([defaultPrefs, mockLocalStorageSet]);

    // Mock fetch to return success
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: {} }),
    } as Response);
  });

  it('should render with default preferences from localStorage when not authenticated', async () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    expect(screen.getByTestId('theme-value')).toHaveTextContent('system');
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('medium');
  });

  it('should fetch preferences from API when authenticated', async () => {
    // Mock authentication state
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock API response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          preferences: {
            theme: 'dark',
            fontSize: 'large',
          },
        }),
    } as Response);

    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Should call fetch to get user preferences
    expect(global.fetch).toHaveBeenCalledWith('/api/user/preferences');

    // Should display merged preferences
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('large');
  });

  it('should update a single preference', async () => {
    const user = userEvent.setup();

    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Initial state
    expect(screen.getByTestId('theme-value')).toHaveTextContent('system');

    // Update theme
    await user.click(screen.getByTestId('update-theme-btn'));

    // Should update localStorage
    expect(mockLocalStorageSet).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'dark',
      }),

    // Should update the display
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
  });

  it('should update multiple preferences at once', async () => {
    const user = userEvent.setup();

    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Initial state
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('medium');

    // Update multiple preferences
    await user.click(screen.getByTestId('update-multiple-btn'));

    // Should update localStorage with multiple values
    expect(mockLocalStorageSet).toHaveBeenCalledWith(
      expect.objectContaining({
        fontSize: 'large',
        reducedMotion: true,
      }),

    // Should update the display
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('large');
  });

  it('should reset preferences to defaults', async () => {
    const user = userEvent.setup();

    // Start with modified preferences
    vi.mocked(useLocalStorage).mockReturnValue([
      { ...defaultPrefs, theme: 'dark', fontSize: 'large' },
      mockLocalStorageSet,
    ]);

    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Initial modified state
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(screen.getByTestId('font-size-value')).toHaveTextContent('large');

    // Reset preferences
    await user.click(screen.getByTestId('reset-btn'));

    // Should reset to defaults in localStorage
    expect(mockLocalStorageSet).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'system',
        fontSize: 'medium',
      }),

  });

  it('should save preferences to API when authenticated', async () => {
    const user = userEvent.setup();

    // Mock authentication state
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Update theme
    await user.click(screen.getByTestId('update-theme-btn'));

    // Should call API to save preferences
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/user/preferences',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }),

    // Check the actual body sent
    const callArgs = vi.mocked(global.fetch).mock.calls[1];
    const requestBody = JSON.parse(callArgs[1].body as string);

    expect(requestBody).toHaveProperty('preferences');
    expect(requestBody.preferences).toHaveProperty('theme', 'dark');
  });

  it('should handle API errors gracefully', async () => {
    // Mock authentication state
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock API error
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>,

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Should log error but not crash
    expect(mockConsoleError).toHaveBeenCalled();

    // Should still show preferences from localStorage
    expect(screen.getByTestId('theme-value')).toHaveTextContent('system');

    mockConsoleError.mockRestore();
  }));
