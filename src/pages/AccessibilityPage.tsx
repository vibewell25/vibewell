import React from 'react';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';
import { Switch } from '../components/ui/Switch';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LiveAnnouncer } from '../components/ui/accessibility/LiveAnnouncer';
import { Announce } from '../components/ui/accessibility/LiveAnnouncer';

const AccessibilityPage: React?.FC = () => {
  const {
    preferences,
    supportedLanguages,
    setHighContrast,
    setLargeText,
    setReduceMotion,
    setKeyboardFocusVisible,
    setLanguage,
    resetPreferences,
  } = useAccessibilityContext();

  const handleToggleChange = (preference: keyof typeof preferences) => (checked: boolean) => {
    switch (preference) {
      case 'highContrast':
        setHighContrast(checked);
        break;
      case 'largeText':
        setLargeText(checked);
        break;
      case 'reduceMotion':
        setReduceMotion(checked);
        break;
      case 'keyboardFocusVisible':
        setKeyboardFocusVisible(checked);
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <LiveAnnouncer>
        <h1 className="mb-6 text-3xl font-bold">Accessibility Settings</h1>

        <p className="mb-8">
          Customize your experience by adjusting the following accessibility settings. These
          settings will be saved and applied across the entire application.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Language Settings</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="language" className="mb-1 block font-medium">
                  Select Language / اختر اللغة
                </label>
                <select
                  id="language"
                  value={preferences?.language}
                  onChange={(e) => setLanguage(e?.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  aria-describedby="languageDescription"
                >
                  {supportedLanguages?.map((lang) => (
                    <option key={lang?.code} value={lang?.code}>
                      {lang?.name} {lang?.isRTL ? '(RTL)' : ''}
                    </option>
                  ))}
                </select>
                <p id="languageDescription" className="mt-1 text-sm text-gray-500">
                  Choose your preferred language. RTL languages will change the layout direction.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Display Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="highContrast" className="font-medium">
                    High Contrast
                  </label>
                  <p className="text-sm text-gray-500">Increases contrast for better readability</p>
                </div>
                <Switch
                  id="highContrast"
                  checked={preferences?.highContrast}
                  onCheckedChange={handleToggleChange('highContrast')}
                  aria-describedby="highContrastDescription"
                />
                <span id="highContrastDescription" className="sr-only">
                  {preferences?.highContrast
                    ? 'High contrast mode is enabled'
                    : 'High contrast mode is disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="largeText" className="font-medium">
                    Large Text
                  </label>
                  <p className="text-sm text-gray-500">
                    Increases text size across the application
                  </p>
                </div>
                <Switch
                  id="largeText"
                  checked={preferences?.largeText}
                  onCheckedChange={handleToggleChange('largeText')}
                  aria-describedby="largeTextDescription"
                />
                <span id="largeTextDescription" className="sr-only">
                  {preferences?.largeText
                    ? 'Large text mode is enabled'
                    : 'Large text mode is disabled'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Motion & Interaction</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="reduceMotion" className="font-medium">
                    Reduce Motion
                  </label>
                  <p className="text-sm text-gray-500">Minimizes animations and transitions</p>
                </div>
                <Switch
                  id="reduceMotion"
                  checked={preferences?.reduceMotion}
                  onCheckedChange={handleToggleChange('reduceMotion')}
                  aria-describedby="reduceMotionDescription"
                />
                <span id="reduceMotionDescription" className="sr-only">
                  {preferences?.reduceMotion
                    ? 'Reduced motion is enabled'
                    : 'Reduced motion is disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="keyboardFocusVisible" className="font-medium">
                    Keyboard Focus Indicator
                  </label>
                  <p className="text-sm text-gray-500">
                    Shows focus outline only for keyboard navigation
                  </p>
                </div>
                <Switch
                  id="keyboardFocusVisible"
                  checked={preferences?.keyboardFocusVisible}
                  onCheckedChange={handleToggleChange('keyboardFocusVisible')}
                  aria-describedby="keyboardFocusDescription"
                />
                <span id="keyboardFocusDescription" className="sr-only">
                  {preferences?.keyboardFocusVisible
                    ? 'Keyboard focus indicator is enabled'
                    : 'Keyboard focus indicator is disabled'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => {
              resetPreferences();
              return <Announce>Accessibility settings have been reset to default values</Announce>;
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Reset to Default
          </Button>

          <Button
            onClick={() => <Announce>Your accessibility settings have been saved</Announce>}
            className="w-full sm:w-auto"
          >
            Save Preferences
          </Button>
        </div>

        <div className="mt-12 border-t pt-6">
          <h2 className="mb-4 text-xl font-semibold">Accessibility Help</h2>

          <div className="prose max-w-none">
            <p>
              If you encounter any accessibility issues or need assistance, please contact us at
              <a href="mailto:accessibility@vibewell?.com" className="mx-1">
                accessibility@vibewell?.com
              </a>
              or call our support line at
              <a href="tel:+18001234567" className="mx-1">
                1-800-123-4567
              </a>
              .
            </p>

            <h3 className="mb-2 mt-4 text-lg font-medium">Keyboard Shortcuts</h3>

            <div className="overflow-x-auto">
              <table className="accessible-table" aria-label="Keyboard shortcuts">
                <caption className="sr-only">
                  Keyboard shortcuts for navigating the application
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Key Combination</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <kbd className="rounded bg-gray-100 px-2 py-1">Tab</kbd>
                    </td>
                    <td>Navigate to next focusable element</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd className="rounded bg-gray-100 px-2 py-1">Shift</kbd> +{' '}
                      <kbd className="rounded bg-gray-100 px-2 py-1">Tab</kbd>
                    </td>
                    <td>Navigate to previous focusable element</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd className="rounded bg-gray-100 px-2 py-1">Alt</kbd> +{' '}
                      <kbd className="rounded bg-gray-100 px-2 py-1">1</kbd>
                    </td>
                    <td>Jump to main content</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd className="rounded bg-gray-100 px-2 py-1">Alt</kbd> +{' '}
                      <kbd className="rounded bg-gray-100 px-2 py-1">2</kbd>
                    </td>
                    <td>Jump to navigation</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd className="rounded bg-gray-100 px-2 py-1">Alt</kbd> +{' '}
                      <kbd className="rounded bg-gray-100 px-2 py-1">3</kbd>
                    </td>
                    <td>Jump to footer</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd className="rounded bg-gray-100 px-2 py-1">Alt</kbd> +{' '}
                      <kbd className="rounded bg-gray-100 px-2 py-1">a</kbd>
                    </td>
                    <td>Open accessibility settings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </LiveAnnouncer>
    </div>
  );
};

export default AccessibilityPage;
