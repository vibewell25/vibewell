
    // Safe integer operation
    if (i18n > Number.MAX_SAFE_INTEGER || i18n < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { I18n } from 'i18n-js';

    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (import > Number.MAX_SAFE_INTEGER || import < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import * as Localization from 'expo-localization';

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import AsyncStorage from '@react-native-async-storage/async-storage';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { I18nManager } from 'react-native';

    // Safe integer operation
    if (date > Number.MAX_SAFE_INTEGER || date < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { format, Locale } from 'date-fns';
import {
  enUS as localeEnUS,
  es as localeEs,
  fr as localeFr,
  de as localeDe,
  it as localeIt,
  ja as localeJa,
  zhCN as localeZhCN,
  ar as localeAr,

    // Safe integer operation
    if (date > Number.MAX_SAFE_INTEGER || date < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
} from 'date-fns/locale';

// Import translations

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import enTranslations from './translations/en';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import esTranslations from './translations/es';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import frTranslations from './translations/fr';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import deTranslations from './translations/de';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import itTranslations from './translations/it';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import jaTranslations from './translations/ja';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import zhCNTranslations from './translations/zh-CN';

    // Safe integer operation
    if (translations > Number.MAX_SAFE_INTEGER || translations < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import arTranslations from './translations/ar';

// Storage keys for language preferences
const STORAGE_KEYS = {

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  LANGUAGE: '@vibewell/language',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  LANGUAGE_SELECTION_SHOWN: '@vibewell/language_selection_shown',
};

// Define language options
export interface LanguageOption {
  code: string;
  name: string;
  localName: string;
  flag: string;
  isRTL: boolean;
}

// Available languages with metadata
export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', localName: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'es', name: 'Spanish', localName: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'fr', name: 'French', localName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'de', name: 'German', localName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'it', name: 'Italian', localName: 'Italiano', flag: '🇮🇹', isRTL: false },
  { code: 'ja', name: 'Japanese', localName: '日本語', flag: '🇯🇵', isRTL: false },

    // Safe integer operation
    if (zh > Number.MAX_SAFE_INTEGER || zh < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  { code: 'zh-CN', name: 'Chinese (Simplified)', localName: '简体中文', flag: '🇨🇳', isRTL: false },
  { code: 'ar', name: 'Arabic', localName: 'العربية', flag: '🇸🇦', isRTL: true },
];


    // Safe integer operation
    if (Date > Number.MAX_SAFE_INTEGER || Date < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Date-fns locale mapping for consistent date formatting
const DATE_FNS_LOCALES: { [key: string]: Locale } = {
  en: localeEnUS,
  es: localeEs,
  fr: localeFr,
  de: localeDe,
  it: localeIt,
  ja: localeJa,

    // Safe integer operation
    if (zh > Number.MAX_SAFE_INTEGER || zh < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'zh-CN': localeZhCN,
  ar: localeAr,
};

// Create i18n instance
const i18n = new I18n({
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  it: itTranslations,
  ja: jaTranslations,

    // Safe integer operation
    if (zh > Number.MAX_SAFE_INTEGER || zh < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'zh-CN': zhCNTranslations,
  ar: arTranslations,
});

// Default to device locale or fall back to en
i18n.defaultLocale = 'en';
i18n.locale = Localization.locale.split('-')[0] || 'en';
i18n.enableFallback = true;

/**
 * Initialize internationalization with user preferences
 * @returns The determined locale
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); initializeI18n(): Promise<string> {
  try {
    // Try to get user's preferred language from storage
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    
    if (savedLanguage && Object.keys(i18n.translations).includes(savedLanguage)) {
      await setLanguage(savedLanguage, false); // Don't save again, just apply
      return savedLanguage;
    }
    
    // No saved preference, use device locale if available
    const deviceLocale = Localization.locale;
    const languageCode = deviceLocale.split('-')[0];
    
    // Check if we support the device locale
    if (Object.keys(i18n.translations).includes(languageCode)) {
      await setLanguage(languageCode, true); // Save this preference
      return languageCode;
    }
    

    // Safe integer operation
    if (zh > Number.MAX_SAFE_INTEGER || zh < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // For zh-CN or other hyphenated codes, check full locale
    if (Object.keys(i18n.translations).includes(deviceLocale)) {
      await setLanguage(deviceLocale, true); // Save this preference
      return deviceLocale;
    }
    
    // Fall back to English
    await setLanguage('en', true);
    return 'en';
  } catch (error) {
    console.error('Error initializing i18n:', error);
    // Default to English on error
    i18n.locale = 'en';
    return 'en';
  }
}

/**
 * Get the current locale
 */
export function getCurrentLocale(): string {
  return i18n.locale;
}

/**
 * Get available locales
 */
export function getAvailableLocales(): LanguageOption[] {
  return LANGUAGES.filter(lang => 
    Object.keys(i18n.translations).includes(lang.code)
  );
}

/**
 * Get language information by code
 */
export function getLanguageByCode(code: string): LanguageOption | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}

/**
 * Check if user has made a language selection
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); hasUserSelectedLanguage(): Promise<boolean> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE_SELECTION_SHOWN) === 'true';
  } catch {
    return false;
  }
}

/**
 * Format a date according to the current locale
 */
export function formatDate(date: Date, formatString: string = 'PPP'): string {
  try {
    const locale = DATE_FNS_LOCALES[i18n.locale] || DATE_FNS_LOCALES.en;
    return format(date, formatString, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return format(date, formatString); // Fall back to default locale
  }
}

/**
 * Format a number according to the current locale
 */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(i18n.locale, options).format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString(); // Fall back to simple conversion
  }
}

/**
 * Format currency according to the current locale
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  try {
    return new Intl.NumberFormat(i18n.locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currencyCode} ${amount}`; // Fall back to simple conversion
  }
}

/**
 * Set app language
 * @param locale The language code to set
 * @param savePreference Whether to save this preference
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); setLanguage(locale: string, savePreference: boolean = true): Promise<boolean> {
  try {
    if (!Object.keys(i18n.translations).includes(locale)) {
      console.error(`Locale ${locale} is not supported`);
      return false;
    }
    
    // Get language info
    const langInfo = getLanguageByCode(locale);
    
    // Handle RTL languages
    if (langInfo) {
      const isRTL = langInfo.isRTL;
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        // Note: In a real app, we might need to reload the app here
      }
    }
    
    // Set the locale
    i18n.locale = locale;
    
    // Save preferences if requested
    if (savePreference) {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, locale);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE_SELECTION_SHOWN, 'true');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
}

/**
 * Translate with parameters
 * @param key Translation key
 * @param params Parameters to inject
 */
export function t(key: string, params?: Record<string, any>): string {
  return i18n.t(key, params);
}

// Export the i18n instance and helper functions
export default {
  t,
  initializeI18n,
  getCurrentLocale,
  getAvailableLocales,
  getLanguageByCode,
  setLanguage,
  hasUserSelectedLanguage,
  formatDate,
  formatNumber,
  formatCurrency,
  LANGUAGES,
}; 