'use client';

import React, { useState } from 'react';
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
    document.documentElement.style.fontSize =
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
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // Toggle reduce motion
  const toggleReduceMotion = () => {
    setReduceMotion(!reduceMotion);
    if (!reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" tabIndex={0}>
        {t('settings.accessibility.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme and Language Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4" tabIndex={0}>
            {t('settings.theme.title')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="theme-selector" className="block text-sm font-medium">
                {t('profile.darkMode')}
              </label>
              <select
                id="theme-selector"
                value={theme}
                onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="mt-1 block w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-label={t('settings.theme.title')}
              >
                <option value="light">{t('settings.theme.light')}</option>
                <option value="dark">{t('settings.theme.dark')}</option>
                <option value="system">{t('settings.theme.system')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="language-selector" className="block text-sm font-medium">
                {t('profile.language')}
              </label>
              <div className="w-1/2 flex justify-end">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="pt-4">
              <NotificationPermissionButton />
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4" tabIndex={0}>
            {t('settings.accessibility.title')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="font-size-selector" className="block text-sm font-medium">
                {t('settings.accessibility.fontSize')}
              </label>
              <select
                id="font-size-selector"
                value={fontSize}
                onChange={e => handleFontSizeChange(e.target.value)}
                className="mt-1 block w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-label={t('settings.accessibility.fontSize')}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="block text-sm font-medium">
                {t('settings.accessibility.contrastMode')}
              </span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle-contrast"
                  checked={highContrast}
                  onChange={toggleHighContrast}
                  className="sr-only"
                  aria-label={t('settings.accessibility.contrastMode')}
                />
                <label
                  htmlFor="toggle-contrast"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                    highContrast ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                      highContrast ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  ></span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="block text-sm font-medium">
                {t('settings.accessibility.reduceMotion')}
              </span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle-motion"
                  checked={reduceMotion}
                  onChange={toggleReduceMotion}
                  className="sr-only"
                  aria-label={t('settings.accessibility.reduceMotion')}
                />
                <label
                  htmlFor="toggle-motion"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                    reduceMotion ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
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
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4" tabIndex={0}>
          Demo Content
        </h2>

        <div className="space-y-4">
          <p>
            This text demonstrates the font size changes. You can adjust the font size using the
            dropdown above.
          </p>

          <div
            className={`p-4 rounded-lg bg-blue-100 dark:bg-blue-900 ${highContrast ? 'text-black dark:text-white font-bold' : ''}`}
          >
            This box demonstrates the high contrast mode. Toggle it to see the difference.
          </div>

          <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900">
            <button
              className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${reduceMotion ? 'transition-none' : 'transition-all duration-300 hover:-translate-y-1'}`}
              aria-label="Demo button for reduce motion setting"
            >
              Hover me to see animation (affected by reduce motion setting)
            </button>
          </div>
        </div>
      </div>

      {/* ARIA Example */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4" tabIndex={0}>
          ARIA Examples
        </h2>

        <div className="space-y-4">
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg"
          >
            <p className="font-bold">Accessibility Notice</p>
            <p>This is a live region that will be announced by screen readers when it changes.</p>
          </div>

          <nav aria-label="Pagination">
            <ul className="flex items-center space-x-2">
              <li>
                <button
                  aria-label="Previous page"
                  className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  &laquo; Prev
                </button>
              </li>
              <li>
                <button
                  aria-label="Page 1"
                  aria-current="page"
                  className="p-2 border rounded bg-blue-500 text-white"
                >
                  1
                </button>
              </li>
              <li>
                <button
                  aria-label="Page 2"
                  className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  2
                </button>
              </li>
              <li>
                <button
                  aria-label="Next page"
                  className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Next &raquo;
                </button>
              </li>
            </ul>
          </nav>

          <div className="mt-4">
            <label id="progress-label" className="block mb-2">
              Download Progress (ARIA Progressbar Example):
            </label>
            <div
              role="progressbar"
              aria-labelledby="progress-label"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700"
            >
              <div className="bg-blue-600 h-4 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="sr-only">75 percent complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
