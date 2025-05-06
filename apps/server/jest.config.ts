import type { Config } from '@jest/types';

const config: Config.InitialOptions = {

    preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  verbose: true,
export default config;
