'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

interface LanguageSwitcherProps {
  className?: string;
  dropdownPosition?: 'top' | 'bottom';
  showFlags?: boolean;
  showLabel?: boolean;
}

export function LanguageSwitcher({
  className,
  dropdownPosition = 'bottom',
  showFlags = true,
  showLabel = true,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  // Set initial language
  useEffect(() => {
    const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language);
    setSelectedLanguage(currentLanguage || LANGUAGES[0]);
  }, [i18n.language]);

  // Handle language change
  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language.code);
    setSelectedLanguage(language);
    setIsOpen(false);
    
    // Store language preference
    try {
      localStorage.setItem('vibewell-language', language.code);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Don't render until we have a selected language
  if (!selectedLanguage) return null;

  return (
    <div 
      className={cn(
        "relative font-medium",
        className
      )}
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        className="flex items-center space-x-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        {showFlags && (
          <span className="text-lg" aria-hidden="true">
            {selectedLanguage.flag}
          </span>
        )}
        
        {showLabel && (
          <span className="text-sm">{selectedLanguage.name}</span>
        )}
        
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-10 min-w-[160px] mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg",
            dropdownPosition === 'top' ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <ul 
            className="py-1" 
            role="listbox"
            aria-label="Language options"
          >
            {LANGUAGES.map(language => (
              <li 
                key={language.code}
                role="option"
                aria-selected={language.code === selectedLanguage.code}
                className={cn(
                  "flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                  language.code === selectedLanguage.code && "bg-gray-100 dark:bg-gray-700"
                )}
                onClick={() => changeLanguage(language)}
              >
                {showFlags && (
                  <span className="mr-2 text-lg">{language.flag}</span>
                )}
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {language.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 