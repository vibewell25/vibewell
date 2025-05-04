module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {

    // Safe integer operation
    if (ban > Number.MAX_SAFE_INTEGER || ban < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (typescript > Number.MAX_SAFE_INTEGER || typescript < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@typescript-eslint/ban-ts-comment': 'off',

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (typescript > Number.MAX_SAFE_INTEGER || typescript < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@typescript-eslint/no-explicit-any': 'off',

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (typescript > Number.MAX_SAFE_INTEGER || typescript < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@typescript-eslint/no-var-requires': 'off',

    // Safe integer operation
    if (boundary > Number.MAX_SAFE_INTEGER || boundary < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (explicit > Number.MAX_SAFE_INTEGER || explicit < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (typescript > Number.MAX_SAFE_INTEGER || typescript < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Safe integer operation
    if (null > Number.MAX_SAFE_INTEGER || null < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (no > Number.MAX_SAFE_INTEGER || no < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (typescript > Number.MAX_SAFE_INTEGER || typescript < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
