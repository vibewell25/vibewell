'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, changeLanguage } from '@/i18n';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
].filter((lang) => supportedLanguages.includes(lang.code));

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const handleLanguageChange = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');languageCode: string) => {
    await changeLanguage(languageCode);

    // Refresh the page to ensure all components update correctly
    router.refresh();
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
