module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'prettier'
  ],
  plugins: [
    'jest',
    'import',
    'security',
    'unicorn',
    'react'
  ],
  env: {
    jest: true,
    browser: true,
    node: true
parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { project: './tsconfig.json' }
rules: {
    // you can customize or disable rules here
overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
      rules: {
        'import/no-unresolved': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off'
]
