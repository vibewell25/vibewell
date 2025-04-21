import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Define the preferences interface
 * @interface UserPreferences
 * @property {boolean} notifications - Whether user notifications are enabled
 * @property {'daily' | 'weekly' | 'monthly' | 'never'} emailFrequency - How often email updates are sent
 * @property {'en' | 'es' | 'fr' | 'de'} language - Preferred language
 * @property {'small' | 'medium' | 'large'} fontSize - Preferred font size
 */
interface UserPreferences {
  notifications: boolean;
  emailFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  language: 'en' | 'es' | 'fr' | 'de';
  fontSize: 'small' | 'medium' | 'large';
}

/**
 * Default preferences for new users
 */
const defaultPreferences: UserPreferences = {
  notifications: true,
  emailFrequency: 'weekly',
  language: 'en',
  fontSize: 'medium',
};

/**
 * Props for the UserPreferencesPanel component
 * @interface UserPreferencesProps
 * @property {string} [className] - Optional CSS class name for styling
 */
interface UserPreferencesProps {
  className?: string;
}

/**
 * A component that allows users to manage their preferences,
 * which are stored in localStorage
 *
 * @param {UserPreferencesProps} props - Component properties
 * @returns {JSX.Element} Rendered preferences panel
 */
export const UserPreferencesPanel: React.FC<UserPreferencesProps> = ({ className = '' }) => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'user-preferences',
    defaultPreferences
  );

  /**
   * Handle toggle changes for checkbox inputs
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event from checkbox
   */
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  /**
   * Handle select changes for dropdown inputs
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event from select
   */
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Reset all preferences to their default values
   */
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <div className={`user-preferences-panel ${className}`}>
      <h2 className="text-xl font-bold mb-4">User Preferences</h2>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label htmlFor="notifications" className="font-medium">
            Enable Notifications
          </label>
          <input
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={preferences.notifications}
            onChange={handleToggleChange}
            className="h-4 w-4"
          />
        </div>

        {/* Email Frequency */}
        <div className="space-y-2">
          <label htmlFor="emailFrequency" className="block font-medium">
            Email Frequency
          </label>
          <select
            id="emailFrequency"
            name="emailFrequency"
            value={preferences.emailFrequency}
            onChange={handleSelectChange}
            className="block w-full p-2 border rounded-md"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label htmlFor="language" className="block font-medium">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={preferences.language}
            onChange={handleSelectChange}
            className="block w-full p-2 border rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label htmlFor="fontSize" className="block font-medium">
            Font Size
          </label>
          <select
            id="fontSize"
            name="fontSize"
            value={preferences.fontSize}
            onChange={handleSelectChange}
            className="block w-full p-2 border rounded-md"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetPreferences}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};
