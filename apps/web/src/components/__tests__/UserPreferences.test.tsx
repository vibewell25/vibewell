/* eslint-disable */import { render, screen, fireEvent } from '../../test-utils/testing-library';
import { UserPreferencesPanel } from '../UserPreferences';
import * as useLocalStorageModule from '../../hooks/useLocalStorage';

// Mock the useLocalStorage hook
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

const defaultPreferences = {
  notifications: true,
  emailFrequency: 'weekly',
  language: 'en',
  fontSize: 'medium',
};

describe('UserPreferencesPanel', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the default mock implementation
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([defaultPreferences, jest.fn()]);
  }));

  it('renders with default preferences', () => {
    // Act
    render(<UserPreferencesPanel />);

    // Assert
    expect(screen.getByText('User Preferences')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Notifications')).toBeChecked();

    // Check select elements
    const emailFrequencySelect = screen.getByLabelText('Email Frequency') as HTMLSelectElement;
    expect(emailFrequencySelect.value).toBe('weekly');

    const languageSelect = screen.getByLabelText('Language') as HTMLSelectElement;
    expect(languageSelect.value).toBe('en');

    const fontSizeSelect = screen.getByLabelText('Font Size') as HTMLSelectElement;
    expect(fontSizeSelect.value).toBe('medium');
  }));

  it('toggles notification preference when checkbox is clicked', () => {
    // Arrange
    const setPreferencesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([defaultPreferences, setPreferencesMock]);

    // Act
    render(<UserPreferencesPanel />);
    fireEvent.click(screen.getByLabelText('Enable Notifications'));

    // Assert
    expect(setPreferencesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setPreferencesMock.mock.calls[0][0];
    const result = updaterFn(defaultPreferences);
    expect(result).toEqual({
      ...defaultPreferences,
      notifications: false, // Should toggle from true to false
    }));

  it('updates email frequency when select is changed', () => {
    // Arrange
    const setPreferencesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([defaultPreferences, setPreferencesMock]);

    // Act
    render(<UserPreferencesPanel />);
    fireEvent.change(screen.getByLabelText('Email Frequency'), { target: { value: 'daily' } });

    // Assert
    expect(setPreferencesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setPreferencesMock.mock.calls[0][0];
    const result = updaterFn(defaultPreferences);
    expect(result).toEqual({
      ...defaultPreferences,
      emailFrequency: 'daily', // Should change from 'weekly' to 'daily'
    }));

  it('updates language when select is changed', () => {
    // Arrange
    const setPreferencesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([defaultPreferences, setPreferencesMock]);

    // Act
    render(<UserPreferencesPanel />);
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'fr' } });

    // Assert
    expect(setPreferencesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setPreferencesMock.mock.calls[0][0];
    const result = updaterFn(defaultPreferences);
    expect(result).toEqual({
      ...defaultPreferences,
      language: 'fr', // Should change from 'en' to 'fr'
    }));

  it('resets preferences when reset button is clicked', () => {
    // Arrange
    const customPreferences = {
      notifications: false,
      emailFrequency: 'never',
      language: 'de',
      fontSize: 'large',
    };
    const setPreferencesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([customPreferences, setPreferencesMock]);

    // Act
    render(<UserPreferencesPanel />);
    fireEvent.click(screen.getByText('Reset to Defaults'));

    // Assert
    expect(setPreferencesMock).toHaveBeenCalledWith({
      notifications: true,
      emailFrequency: 'weekly',
      language: 'en',
      fontSize: 'medium',
    }));
});
