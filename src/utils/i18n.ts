import React, { useEffect, useContext, useState, useCallback, ReactNode } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

interface Language {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
  country: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr', country: 'US', flag: '🇺🇸' },
  { code: 'es', name: 'Español', dir: 'ltr', country: 'ES', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', dir: 'ltr', country: 'FR', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', dir: 'rtl', country: 'SA', flag: '🇸🇦' },
  { code: 'he', name: 'עברית', dir: 'rtl', country: 'IL', flag: '🇮🇱' },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];

export const RTL_LANGUAGES = SUPPORTED_LANGUAGES.filter(lang => lang.dir === 'rtl').map(lang => lang.code);

export async function initializeI18n() {
  await i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: DEFAULT_LANGUAGE.code,
      supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
      ns: ['common', 'auth', 'dashboard', 'settings'],
      defaultNS: 'common',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        lookupQuerystring: 'lang',
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage', 'cookie'],
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18next;
}

export function getLanguageDirection(languageCode: string): 'ltr' | 'rtl' {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  return language?.dir || 'ltr';
}

export function isRTL(languageCode: string): boolean {
  return RTL_LANGUAGES.includes(languageCode);
}

// Hook to manage document direction
export function useDocumentDirection(languageCode: string) {
  useEffect(() => {
    const dir = getLanguageDirection(languageCode);
    document.documentElement.dir = dir;
    document.documentElement.lang = languageCode;

    return () => {
      document.documentElement.dir = DEFAULT_LANGUAGE.dir;
      document.documentElement.lang = DEFAULT_LANGUAGE.code;
    };
  }, [languageCode]);
}

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
}

const LanguageContext = React.createContext<LanguageContextType>({
  currentLanguage: SUPPORTED_LANGUAGES[0],
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  const setLanguage = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    if (language) {
      setCurrentLanguage(language);
      i18next.changeLanguage(code);
    }
  };

  useDocumentDirection(currentLanguage.code);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// RTL style management
export function createRTLStyles(styles: Record<string, any>): Record<string, any> {
  const rtlStyles: Record<string, any> = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'object') {
      rtlStyles[key] = createRTLStyles(value);
    } else {
      switch (key) {
        case 'left':
          rtlStyles.right = value;
          break;
        case 'right':
          rtlStyles.left = value;
          break;
        case 'paddingLeft':
          rtlStyles.paddingRight = value;
          break;
        case 'paddingRight':
          rtlStyles.paddingLeft = value;
          break;
        case 'marginLeft':
          rtlStyles.marginRight = value;
          break;
        case 'marginRight':
          rtlStyles.marginLeft = value;
          break;
        case 'borderLeft':
          rtlStyles.borderRight = value;
          break;
        case 'borderRight':
          rtlStyles.borderLeft = value;
          break;
        default:
          rtlStyles[key] = value;
      }
    }
  }

  return rtlStyles;
}

// Language selector component
export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <select
      value={currentLanguage.code}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="Select language"
      className="select select-bordered w-full max-w-xs"
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
}

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // English translations
        }
      },
      es: {
        translation: {
          // Spanish translations
        }
      },
      fr: {
        translation: {
          // French translations
        }
      }
    },
    lng: SUPPORTED_LANGUAGES[0].code,
    fallbackLng: SUPPORTED_LANGUAGES[0].code,
    interpolation: {
      escapeValue: false
    }
  });

export default i18next; 