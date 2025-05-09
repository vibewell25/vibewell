import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import Backend from 'i18next-http-backend';

export const defaultNS = 'common';
export const fallbackLng = 'en';
export const supportedLanguages = ['en', 'es', 'fr'];
export const rtlLanguages = ['ar', 'he', 'fa'];

// Define all available namespaces
export const namespaces = [
  'common',
  'auth',

  'beauty-wellness',
  'booking',
  'profile',
  'settings',
] as const;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    fallbackLng,
    supportedLngs: supportedLanguages,
    ns: namespaces,
    backend: {

      loadPath: '/api/translations/{{lng}}/{{ns}}',
detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
interpolation: {
      escapeValue: false,
react: {
      useSuspense: true,
export const isRtl = (language: string) => rtlLanguages.includes(language);

export const changeLanguage = async (language: string) => {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  if (supportedLanguages.includes(language)) {
    await i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl(language) ? 'rtl' : 'ltr';

    // Ensure translations are loaded
    await Promise.all(namespaces.map((ns) => i18n.loadNamespaces(ns)));
// Helper function to load translations dynamically
export {};

export default i18n;
