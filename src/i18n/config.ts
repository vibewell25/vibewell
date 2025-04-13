import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const defaultNS = 'common';
export const fallbackLng = 'en';

export const supportedLanguages = ['en', 'es', 'fr'];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    fallbackLng,
    supportedLngs: supportedLanguages,
    ns: ['common', 'auth', 'beauty-wellness', 'booking'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Lazy loading helper
export const loadNamespace = async (lang: string, ns: string) => {
  if (!i18n.hasResourceBundle(lang, ns)) {
    try {
      const resources = await import(`../locales/${lang}/${ns}.json`);
      i18n.addResourceBundle(lang, ns, resources.default);
    } catch (error) {
      console.error(`Failed to load ${lang}/${ns} translations:`, error);
    }
  }
};

// RTL languages configuration
export const rtlLanguages = ['ar', 'he', 'fa'];
export const isRtl = (language: string) => rtlLanguages.includes(language);

// Language switcher helper
export const changeLanguage = async (language: string) => {
  if (supportedLanguages.includes(language)) {
    await i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl(language) ? 'rtl' : 'ltr';
  }
};

export default i18n; 