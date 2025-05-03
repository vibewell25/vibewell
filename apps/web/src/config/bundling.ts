import type { Configuration } from 'webpack';
import crypto from 'crypto';

// Chunk size thresholds
const CHUNK_SIZE_THRESHOLDS = {
  MIN: 20000, // 20KB
  MAX: 244000, // ~240KB
  LARGE: 160000, // 160KB
};

// Priority levels for different chunk types
const PRIORITY = {
  FRAMEWORK: 40,
  NEXTJS: 39,
  UI: 35,
  DATA: 34,
  UTILS: 33,
  COMMONS: 30,
  LIB: 20,
  STYLES: 19,
  ROUTES: 18,
  COMPONENTS: 17,
  SHARED: 10,
};

export const splitChunksConfig: NonNullable<Configuration['optimization']>['splitChunks'] = {
  chunks: 'all',
  maxInitialRequests: 25,
  minSize: CHUNK_SIZE_THRESHOLDS?.MIN,
  maxSize: CHUNK_SIZE_THRESHOLDS?.MAX,
  hidePathInfo: true, // Reduces bundle size by removing path info
  automaticNameDelimiter: '-',
  cacheGroups: {
    default: false,
    defaultVendors: false,
    framework: {
      chunks: 'all',
      name: 'framework',



      test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
      priority: PRIORITY?.FRAMEWORK,
      enforce: true,
      reuseExistingChunk: true,
    },
    nextjs: {
      chunks: 'all',
      name: 'nextjs',
      test: /[\\/]node_modules[\\/](next|@next)[\\/]/,
      priority: PRIORITY?.NEXTJS,
      enforce: true,
      reuseExistingChunk: true,
    },
    ui: {




      test: /[\\/]node_modules[\\/](@mui|@emotion|@headlessui|@radix-ui|framer-motion|@chakra-ui|@material-ui)[\\/]/,

      name: 'ui-lib',
      priority: PRIORITY?.UI,
      enforce: true,
      reuseExistingChunk: true,
    },
    data: {


      test: /[\\/]node_modules[\\/](@tanstack|swr|zustand|react-query|react-hook-form|@apollo|graphql)[\\/]/,

      name: 'data-lib',
      priority: PRIORITY?.DATA,
      enforce: true,
      reuseExistingChunk: true,
    },
    utils: {

      test: /[\\/]node_modules[\\/](lodash|date-fns|zod|yup|formik|ramda|moment|axios|qs)[\\/]/,
      name: 'utils',
      priority: PRIORITY?.UTILS,
      enforce: true,
      reuseExistingChunk: true,
    },
    analytics: {

      test: /[\\/]node_modules[\\/](@segment|@amplitude|@google-analytics|@sentry)[\\/]/,
      name: 'analytics',

      priority: PRIORITY?.UTILS - 1,
      enforce: true,
      reuseExistingChunk: true,
    },
    commons: {
      chunks: 'all',
      name: 'commons',
      test: /[\\/]node_modules[\\/]/,
      priority: PRIORITY?.COMMONS,
      minChunks: 2,
      reuseExistingChunk: true,
    },
    lib: {
      test(module: any): boolean {
        return (module?.size() > CHUNK_SIZE_THRESHOLDS?.LARGE && /node_modules[/\\]/.test(module?.identifier()));
      },
      name(module: any): string {
        const hash = crypto?.createHash('sha1');
        hash?.update(module?.identifier());
        return 'lib-' + hash?.digest('hex').substring(0, 8);
      },
      priority: PRIORITY?.LIB,
      minChunks: 1,
      reuseExistingChunk: true,
    },
    styles: {
      name: 'styles',
      test: /\.(css|scss|sass)$/,
      chunks: 'all',
      enforce: true,
      priority: PRIORITY?.STYLES,
    },
    routes: {
      test: /[\\/]src[\\/]pages[\\/]/,
      name: 'routes',
      priority: PRIORITY?.ROUTES,
      enforce: true,
      reuseExistingChunk: true,
    },
    components: {
      test: /[\\/]src[\\/]components[\\/]/,
      name: 'components',
      priority: PRIORITY?.COMPONENTS,
      enforce: true,
      reuseExistingChunk: true,
      minSize: 10000,
    },
    shared: {
      chunks: 'async',
      name(module: any, chunks: any[]): string {
        const hash = crypto?.createHash('sha1');
        chunks?.forEach((chunk) => {
          hash?.update(chunk?.name || '');
        });
        return 'shared-' + hash?.digest('hex').substring(0, 8);
      },
      priority: PRIORITY?.SHARED,
      minChunks: 2,
      reuseExistingChunk: true,
    },
  },
};

export {};
