# Internationalization (i18n) Implementation Guide

## Overview

This document outlines the internationalization implementation in the VibeWell platform, including translation management, RTL support, and language switching functionality.

## Features

- Multi-language support with dynamic language switching
- RTL (Right-to-Left) language support
- Automatic language detection
- Fallback language handling
- Translation file management
- Language-specific styling

## Directory Structure

```
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── auth.json
│       │   └── dashboard.json
│       ├── ar/
│       │   ├── common.json
│       │   ├── auth.json
│       │   └── dashboard.json
│       └── ...
├── src/
│   ├── utils/
│   │   └── i18n.tsx
│   └── styles/
│       └── rtl.css
```

## Supported Languages

Currently supported languages:

| Language | Code | Direction | Status |
|----------|------|-----------|---------|
| English  | en   | LTR       | Complete |
| Spanish  | es   | LTR       | Complete |
| French   | fr   | LTR       | Complete |
| Arabic   | ar   | RTL       | Complete |
| Hebrew   | he   | RTL       | Complete |

## Implementation Details

### Translation Setup

1. Initialize i18next with required plugins:
```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

await i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'ar', 'he'],
    ns: ['common', 'auth', 'dashboard'],
    defaultNS: 'common',
  });
```

### Using Translations

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('app.name')}</h1>;
}
```

### RTL Support

1. Document direction is automatically managed:
```typescript
function useDocumentDirection(languageCode: string) {
  useEffect(() => {
    const dir = getLanguageDirection(languageCode);
    document.documentElement.dir = dir;
    document.documentElement.lang = languageCode;
  }, [languageCode]);
}
```

2. RTL-specific styles are applied using the `[dir="rtl"]` selector:
```css
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .nav-item {
  float: right;
}
```

### Language Selection

The `LanguageSelector` component provides a user interface for language switching:

```typescript
export const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <select
      value={currentLanguage.code}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="Select language"
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
};
```

## Translation File Structure

Translation files follow a nested structure for organization:

```json
{
  "app": {
    "name": "VibeWell",
    "description": "Your wellness journey starts here"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard"
  }
}
```

## RTL Considerations

When developing RTL-compatible components:

1. Use logical properties instead of physical ones:
   - Use `margin-inline-start` instead of `margin-left`
   - Use `padding-inline-end` instead of `padding-right`

2. Use RTL-aware flexbox:
```css
[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}
```

3. Mirror icons and images when needed:
```css
[dir="rtl"] .icon-rotate-rtl {
  transform: scaleX(-1);
}
```

## Best Practices

1. **Translation Keys**
   - Use nested keys for better organization
   - Keep keys descriptive and consistent
   - Use lowercase with hyphens for separation

2. **Dynamic Content**
   - Use interpolation for dynamic values
   - Handle pluralization properly
   - Consider word order differences in translations

3. **RTL Support**
   - Test layouts in both LTR and RTL
   - Use logical properties where possible
   - Consider text expansion in different languages

4. **Performance**
   - Load translations asynchronously
   - Implement proper code splitting
   - Cache translations appropriately

## Adding a New Language

1. Create a new directory under `public/locales/`
2. Add translation files for all namespaces
3. Add language to `SUPPORTED_LANGUAGES` array
4. Update documentation
5. Test thoroughly in the new language

## Testing

1. **Translation Coverage**
   - Ensure all keys are translated
   - Check for missing translations
   - Verify interpolation works

2. **RTL Testing**
   - Test all layouts in RTL mode
   - Verify text alignment
   - Check component behavior

3. **Language Switching**
   - Test dynamic language switching
   - Verify persistence of language selection
   - Check fallback behavior

## Troubleshooting

Common issues and solutions:

1. **Missing Translations**
   - Check namespace configuration
   - Verify translation file structure
   - Check for typos in translation keys

2. **RTL Layout Issues**
   - Verify dir attribute is set correctly
   - Check CSS specificity
   - Inspect flexbox direction

3. **Performance Issues**
   - Implement proper code splitting
   - Use lazy loading for translations
   - Monitor bundle size

## Future Improvements

1. Add more languages:
   - German (de)
   - Chinese (zh)
   - Japanese (ja)

2. Enhance RTL support:
   - Improve component library RTL compatibility
   - Add more RTL-specific optimizations

3. Improve translation workflow:
   - Implement translation management system
   - Add automated translation validation
   - Create translation contribution guidelines 