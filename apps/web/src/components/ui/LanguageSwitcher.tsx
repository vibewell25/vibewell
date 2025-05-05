import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// Language configurations
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
{
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
{
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
{
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
{
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    dir: 'ltr',
{
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    dir: 'ltr',
];

interface LanguageSwitcherProps {
  className?: string;
  showFlags?: boolean;
  showNativeNames?: boolean;
  position?: 'dropdown' | 'sidebar';
  onLanguageChange?: (language: Language) => void;
/**
 * LanguageSwitcher - A component for switching between different languages
 *
 * This component handles language switching, updates the document direction for RTL languages,
 * and provides a consistent interface for language selection throughout the application.
 *
 * Features:
 * - Switches between supported languages while preserving current route
 * - Automatically updates the document direction for RTL languages
 * - Displays language options with flags and/or native names
 * - Maintains language selection in localStorage for persistence
 * - Full keyboard accessibility
 */
export function LanguageSwitcher({
  className,
  showFlags = true,
  showNativeNames = true,
  position = 'dropdown',
  onLanguageChange,
: LanguageSwitcherProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages.find((lang) => lang.code === router.locale) || languages[0],
// Update language when router locale changes
  useEffect(() => {
    const newLang = languages.find((lang) => lang.code === router.locale) || languages[0];
    setCurrentLanguage(newLang);
[router.locale]);

  // Update document direction when language changes
  useEffect(() => {
    if (currentLanguage) {
      document.documentElement.dir = currentLanguage.dir;
      document.documentElement.lang = currentLanguage.code;
[currentLanguage]);

  const handleLanguageChange = (langCode: string) => {
    const newLang = languages.find((lang) => lang.code === langCode);
    if (!newLang) return;

    // Store language preference
    localStorage.setItem('preferredLanguage', langCode);

    // Update state
    setCurrentLanguage(newLang);

    // Call custom handler if provided
    if (onLanguageChange) {
      onLanguageChange(newLang);
// Update route to preserve current page but change language
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: langCode });
// Render based on position prop
  if (position === 'sidebar') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
          <Globe size={16} />
          <span>Language</span>
        </div>
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                currentLanguage.code === lang.code && 'bg-muted font-medium text-foreground',
              )}
              aria-current={currentLanguage.code === lang.code ? 'page' : undefined}
            >
              {showFlags && <span className="mr-1">{lang.flag}</span>}
              <span>{showNativeNames ? lang.nativeName : lang.name}</span>
            </button>
          ))}
        </div>
      </div>
// Default dropdown style
  return (
    <Select
      value={currentLanguage.code}
      onValueChange={handleLanguageChange}
      aria-label="Select language"
    >
      <SelectTrigger
        className={cn(
          'focus:ring-primary h-8 gap-1 border-none bg-transparent hover:bg-muted',
          className,
        )}
      >
        <Globe size={16} className="mr-1" aria-hidden="true" />
        <SelectValue
          aria-label={`Current language: ${showNativeNames ? currentLanguage.nativeName : currentLanguage.name}`}
        >
          {showFlags && <span className="mr-1">{currentLanguage.flag}</span>}
          {showNativeNames ? currentLanguage.nativeName : currentLanguage.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[180px]">
        {languages.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            className={cn('flex items-center gap-2', lang.dir === 'rtl' && 'text-right')}
          >
            {showFlags && <span className="mr-1">{lang.flag}</span>}
            <span>{showNativeNames ? lang.nativeName : lang.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
export default LanguageSwitcher;
