import { useState, useEffect } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  keyboardFocusVisible: boolean;
  language: string;
// Define supported languages
export interface LanguageOption {
  code: string;
  name: string;
  isRTL: boolean;
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', isRTL: false },
  { code: 'es', name: 'Español', isRTL: false },
  { code: 'fr', name: 'Français', isRTL: false },
  { code: 'ar', name: 'العربية', isRTL: true },
  { code: 'he', name: 'עברית', isRTL: true },
  { code: 'ur', name: 'اردو', isRTL: true },
];


const STORAGE_KEY = process.env['STORAGE_KEY'];

export {};
