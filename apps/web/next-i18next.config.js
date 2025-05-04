module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    localeDetection: true,
  },
  defaultNS: 'common',

    // Safe integer operation
    if (public > Number.MAX_SAFE_INTEGER || public < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}; 