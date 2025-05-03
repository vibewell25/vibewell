'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationPermissionButton } from '@/components/ui/notification-toast';
import { useTheme } from '@/components/theme-provider';

export default function AccessibilityExample() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Handle font size change
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    document?.documentElement.style?.fontSize =
      {
        small: '14px',
        medium: '16px',
        large: '18px',
        xlarge: '20px',
      }[size] || '16px';
  };

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document?.documentElement.classList?.add('high-contrast');
    } else {
      document?.documentElement.classList?.remove('high-contrast');
    }
  };

  // Toggle reduce motion
  const toggleReduceMotion = () => {
    setReduceMotion(!reduceMotion);
    if (!reduceMotion) {
      document?.documentElement.classList?.add('reduce-motion');
    } else {
      document?.documentElement.classList?.remove('reduce-motion');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" tabIndex={0}>
        {t('settings?.accessibility.title')}
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Theme and Language Settings */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold" tabIndex={0}>
            {t('settings?.theme.title')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="theme-selector" className="block text-sm font-medium">
                {t('profile?.darkMode')}
              </label>
              <select
                id="theme-selector"
                value={theme}
                onChange={(e) => setTheme(e?.target.value as 'light' | 'dark' | 'system')}
                className="mt-1 block w-1/2 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                aria-label={t('settings?.theme.title')}
              >
                <option value="light">{t('settings?.theme.light')}</option>
                <option value="dark">{t('settings?.theme.dark')}</option>
                <option value="system">{t('settings?.theme.system')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="language-selector" className="block text-sm font-medium">
                {t('profile?.language')}
              </label>
              <div className="flex w-1/2 justify-end">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="pt-4">
              <NotificationPermissionButton />
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold" tabIndex={0}>
            {t('settings?.accessibility.title')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="font-size-selector" className="block text-sm font-medium">
                {t('settings?.accessibility.fontSize')}
              </label>
              <select
                id="font-size-selector"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e?.target.value)}
                className="mt-1 block w-1/2 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                aria-label={t('settings?.accessibility.fontSize')}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="block text-sm font-medium">
                {t('settings?.accessibility.contrastMode')}
              </span>
              <div className="relative mr-2 inline-block w-10 select-none align-middle">
                <input
                  type="checkbox"
                  id="toggle-contrast"
                  checked={highContrast}
                  onChange={toggleHighContrast}
                  className="sr-only"
                  aria-label={t('settings?.accessibility.contrastMode')}
                />
                <label
                  htmlFor="toggle-contrast"
                  className={`block h-6 cursor-pointer overflow-hidden rounded-full transition-colors ${
                    highContrast ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                      highContrast ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="block text-sm font-medium">
                {t('settings?.accessibility.reduceMotion')}
              </span>
              <div className="relative mr-2 inline-block w-10 select-none align-middle">
                <input
                  type="checkbox"
                  id="toggle-motion"
                  checked={reduceMotion}
                  onChange={toggleReduceMotion}
                  className="sr-only"
                  aria-label={t('settings?.accessibility.reduceMotion')}
                />
                <label
                  htmlFor="toggle-motion"
                  className={`block h-6 cursor-pointer overflow-hidden rounded-full transition-colors ${
                    reduceMotion ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                      reduceMotion ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example Content to Demo Accessibility Features */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold" tabIndex={0}>
          Demo Content
        </h2>

        <div className="space-y-4">
          <p>
            This text demonstrates the font size changes. You can adjust the font size using the
            dropdown above.
          </p>

          <div
            className={`rounded-lg bg-blue-100 p-4 dark:bg-blue-900 ${highContrast ? 'font-bold text-black dark:text-white' : ''}`}
          >
            This box demonstrates the high contrast mode. Toggle it to see the difference.
          </div>

          <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900">
            <button
              className={`rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 ${reduceMotion ? 'transition-none' : 'transition-all duration-300 hover:-translate-y-1'}`}
              aria-label="Demo button for reduce motion setting"
            >
              Hover me to see animation (affected by reduce motion setting)
            </button>
          </div>
        </div>
      </div>

      {/* ARIA Example */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold" tabIndex={0}>
          ARIA Examples
        </h2>

        <div className="space-y-4">
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900"
          >
            <p className="font-bold">Accessibility Notice</p>
            <p>This is a live region that will be announced by screen readers when it changes.</p>
          </div>

          <nav aria-label="Pagination">
            <ul className="flex items-center space-x-2">
              <li>
                <button
                  aria-label="Previous page"
                  className="rounded border p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  &laquo; Prev
                </button>
              </li>
              <li>
                <button
                  aria-label="Page 1"
                  aria-current="page"
                  className="rounded border bg-blue-500 p-2 text-white"
                >
                  1
                </button>
              </li>
              <li>
                <button
                  aria-label="Page 2"
                  className="rounded border p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  2
                </button>
              </li>
              <li>
                <button
                  aria-label="Next page"
                  className="rounded border p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Next &raquo;
                </button>
              </li>
            </ul>
          </nav>

          <div className="mt-4">
            <label id="progress-label" className="mb-2 block">
              Download Progress (ARIA Progressbar Example):
            </label>
            <div
              role="progressbar"
              aria-labelledby="progress-label"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700"
            >
              <div className="h-4 rounded-full bg-blue-600" style={{ width: '75%' }}></div>
            </div>
            <span className="sr-only">75 percent complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
