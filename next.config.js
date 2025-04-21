/** @type {import('next').NextConfig} */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const crypto = require('crypto');
const { withSentryConfig } = require('@sentry/nextjs');
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});
const CompressionPlugin = require('compression-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_AUTH0_NAMESPACE: process.env.AUTH0_NAMESPACE || 'https://vibewell.com',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_FILE_BASE_URL: process.env.NEXT_PUBLIC_FILE_BASE_URL,
  },
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile pictures
      's.gravatar.com', // For Gravatar images
      'images.unsplash.com', // For Unsplash images
      'platform-lookaside.fbsbx.com', // For Facebook profile pictures
      process.env.AWS_S3_BUCKET ? `${process.env.AWS_S3_BUCKET}.s3.amazonaws.com` : 'vibewell-uploads.s3.amazonaws.com', // For AWS S3 images
      'res.cloudinary.com',
      'via.placeholder.com',
      'source.unsplash.com',
      'cdn.shopify.com',
      'i.pravatar.cc',
      'vibewell-assets.s3.amazonaws.com',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    // Enhanced image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    path: '/_next/image',
    disableStaticImages: false,
    unoptimized: false,
  },
  // Optimize file watching
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Optimize builds
  swcMinify: true,
  // Improve performance
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  // Handle TypeScript paths
  experimental: {
    typedRoutes: true,
    // Enable modern optimizations
    optimizeCss: true,
    // Improve module resolution
    esmExternals: true,
    optimizePackageImports: [
      '@headlessui/react',
      '@heroicons/react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash',
      'framer-motion',
      '@tanstack/react-query',
      'react-hook-form',
      'zustand',
      'zod',
    ],
    serverActions: true,
    serverComponents: true,
    scrollRestoration: true,
    browsersListForSwc: true,
    legacyBrowsers: false,
    // Enable app directory partial ISR/SSG
    isrMemoryCacheSize: 0,
    // Enhanced streaming features
    largePageDataBytes: 128 * 1000, // 128KB
    // Improved React optimization
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
    // Enable Modularize Imports
    modularizeImports: {
      'lodash/': {
        transform: 'lodash/{{member}}',
        preventFullImport: true,
      },
      '@mui/material/': {
        transform: '@mui/material/{{member}}',
        preventFullImport: true,
      },
      '@mui/icons-material/': {
        transform: '@mui/icons-material/{{member}}',
        preventFullImport: true,
      },
    },
    serverComponentsExternalPackages: ['sharp'],
    optimisticClientCache: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*;"
              : ""
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Add cache control for static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Configure webpack and file watching
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      config.devtool = 'eval-source-map';
    }

    // Improve module resolution
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      },
      modules: [
        ...config.resolve.modules || [],
        'src',
        'node_modules',
      ],
    };

    // Handle path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '~': './src',
    };

    // Important to transpile modern JavaScript for older browsers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        path: require.resolve('path-browserify'),
      };
    }

    // Enable tree shaking and optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      minimize: !dev,
      minimizer: [
        ...config.optimization.minimizer || [],
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: process.env.NODE_ENV === 'production',
              drop_debugger: process.env.NODE_ENV === 'production',
              pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
            },
            format: {
              comments: false,
            },
            mangle: true,
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                minifyFontValues: { removeQuotes: false },
              },
            ],
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          recharts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'recharts-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          maps: {
            test: /[\\/]node_modules[\\/](leaflet|mapbox-gl|react-map-gl)[\\/]/,
            name: 'map-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          chart: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
            name: 'chart-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui)[\\/]/,
            name: 'ui-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          commons: {
            test: /[\\/]node_modules[\\/](react|react-dom|framer-motion)[\\/]/,
            name: 'commons',
            chunks: 'all',
            priority: 20,
          },
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|formik|yup|zod)[\\/]/,
            name: 'forms-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          routes: {
            test: /[\\/]src[\\/]app[\\/](.+)[\\/]page\.(js|ts)x?$/,
            name: (module) => {
              const routePath = module.resource.match(/[\\/]src[\\/]app[\\/](.+)[\\/]page\.(js|ts)x?$/)[1];
              return `route-${routePath.replace(/[\\/]/g, '-')}`;
            },
            priority: 30,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        }
      },
    };

    // Add compression plugins for production
    if (!dev && !isServer) {
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }

    // Add bundle analyzer in analyze mode
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    // Dynamic imports are better chunked
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            plugins: [
              require.resolve('babel-plugin-transform-dynamic-import-vars')
            ],
          },
        },
      ],
    });

    return config;
  },
  // Improve module resolution for Three.js and other large libraries
  modularizeImports: {
    '@react-three/drei': {
      transform: '@react-three/drei/{{member}}',
      skipDefaultConversion: true,
    },
    '@react-three/fiber': {
      transform: '@react-three/fiber/{{member}}',
      skipDefaultConversion: true,
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    '@heroicons/react': {
      transform: '@heroicons/react/{{member}}',
    },
  },
  // Improve path handling
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable the powered by header for security
  poweredByHeader: false,
  // Add any necessary rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/webhooks/:path*',
        destination: '/api/webhooks/:path*',
      },
      {
        source: '/api/upload',
        destination: '/api/upload',
      },
      {
        source: '/api/payments/:path*',
        destination: '/api/payments/:path*',
      },
    ];
  },
  // Add redirect for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/profile/settings',
        permanent: false,
      },
    ];
  },
};

// Merge with existing Sentry config if present
const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
};

// Export the config with Sentry support
const configWithSentry = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

// Wrap with PWA and Sentry configurations
const configWithPWA = withPWA(configWithSentry);
const configWithBundleAnalyzer = withBundleAnalyzer(configWithPWA);

// Apply Sentry config only in production
const config = process.env.NODE_ENV === 'production'
  ? withSentryConfig(
      configWithBundleAnalyzer,
      {
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // Upload source maps in production
        widenClientFileUpload: true,
        transpileClientSDK: true,
        hideSourceMaps: false,
        disableLogger: true,
      }
    )
  : configWithBundleAnalyzer;

module.exports = config;