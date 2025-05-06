import React, { ReactNode } from 'react';

interface TranslationLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
export function TranslationLoader({ children }: TranslationLoaderProps) {
  return <>{children}</>;
