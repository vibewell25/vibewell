import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { DynamicOptionsLoadingProps } from 'next/dynamic';
import Loading from '@/components/ui/loading';

interface DynamicImportOptions {
  loading?: ComponentType<DynamicOptionsLoadingProps>;
  ssr?: boolean;
}

type DynamicImportModule<T> = Promise<{
  default?: ComponentType<T>;
  [key: string]: ComponentType<T> | undefined;
}>;

export function dynamicImport<T>(
  importFn: () => DynamicImportModule<T>,
  options: DynamicImportOptions = {},
) {
  return dynamic(() => importFn().then((mod) => mod.default || Object.values(mod)[0]), {
    loading: options.loading ?? Loading,
    ssr: options.ssr ?? true,
  });
}

// Example usage:
// const DynamicComponent = dynamicImport(() => import('@/components/HeavyComponent'));
