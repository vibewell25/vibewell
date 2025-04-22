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
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        }
      }
    }
  ]
});
const CompressionPlugin = require('compression-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { splitChunksConfig, optimizationConfig } = require('./src/config/bundling');
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_AUTH0_NAMESPACE: process.env.AUTH0_NAMESPACE || 'https://vibewell.com',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_FILE_BASE_URL: process.env.NEXT_PUBLIC_FILE_BASE_URL,
    ENABLE_SSR_STREAMING: process.env.ENABLE_SSR_STREAMING,
    ENABLE_SSR_SUSPENSE: process.env.ENABLE_SSR_SUSPENSE,
    ENABLE_SSR_PREFETCH: process.env.ENABLE_SSR_PREFETCH,
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
      'vibewell.com',
      'cdn.vibewell.com',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
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
    // Enhanced image quality settings
    quality: 75,
    // Improved image loading
    loading: 'lazy',
    placeholder: 'blur',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPy0/ODMuNj5EREVFSElIUjY+S2JLUkREUf/2wBDAR',
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
    concurrentFeatures: true,
    optimizeServerReact: true,
    optimizeImages: true,
    swcTraceProfiling: true,
    forceSwcTransforms: true,
    fullySpecified: true,
    optimizeCss: true,
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
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@chakra-ui/react',
      'react-icons',
      'recharts',
      '@visx/scale',
      'd3-scale',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
    // Enable modern optimizations
    turbotrace: {
      logLevel: 'error',
      contextDirectory: __dirname,
      processCwd: __dirname,
      memoryLimit: 4096, // 4GB memory limit for turbotrace
    },
    outputFileTracingRoot: __dirname,
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        '.git/**/*',
        '**/*.map',
        '**/tests/**/*',
        '**/stories/**/*',
        '**/cypress/**/*',
        '**/coverage/**/*',
      ],
    },
    // Enhanced streaming and suspense
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000', 'vibewell.com'],
    },
    serverComponentsExternalPackages: ['sharp', 'ioredis', 'redis'],
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
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
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
      '@': path.join(__dirname, './src'),
      '@components': path.join(__dirname, './src/components'),
      '@hooks': path.join(__dirname, './src/hooks'),
      '@utils': path.join(__dirname, './src/utils'),
      '@styles': path.join(__dirname, './src/styles'),
      '@types': path.join(__dirname, './src/types'),
      '@context': path.join(__dirname, './src/context'),
      '@services': path.join(__dirname, './src/services'),
      '@constants': path.join(__dirname, './src/constants'),
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
      providedExports: true,
      sideEffects: true,
      concatenateModules: true,
      minimize: !dev,
      minimizer: [
        ...config.optimization.minimizer || [],
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: process.env.NODE_ENV === 'production',
              drop_debugger: process.env.NODE_ENV === 'production',
              pure_funcs: process.env.NODE_ENV === 'production' ? 
                ['console.log', 'console.info', 'console.debug', 'console.time', 'console.timeEnd'] : [],
              passes: 3,
              unsafe_math: true,
              unsafe_methods: true,
              unsafe_proto: true,
              unsafe_regexp: true,
              unsafe_undefined: true,
            },
            format: {
              comments: false,
              preserve_annotations: true,
            },
            mangle: {
              safari10: true,
              keep_classnames: false,
              keep_fnames: false,
              toplevel: true,
            },
            sourceMap: false,
          },
          extractComments: false,
          parallel: true,
        }),
      ],
      splitChunks: splitChunksConfig,
    };

    // Apply optimizations only in production
    if (!dev) {
      // Enable compression
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          compressionOptions: { level: 11 },
          threshold: 10240,
          minRatio: 0.8,
        })
      );

      // Optimize CSS
      config.optimization.minimizer.push(
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'advanced',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: false,
              },
            ],
          },
        })
      );

      // Apply custom chunk splitting
      config.optimization = {
        ...config.optimization,
        ...optimizationConfig,
      };
    }

    // Add performance hints
    config.performance = {
      maxEntrypointSize: 512000, // 500KB
      maxAssetSize: 512000, // 500KB
      hints: dev ? false : 'warning',
    };

    // Add custom babel configuration
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            ['@babel/plugin-transform-runtime'],
            ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
          ],
        },
      },
    });

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

    // Add module federation for micro-frontends
    if (!isServer) {
      config.plugins.push(
        new config.webpack.container.ModuleFederationPlugin({
          name: 'vibewell',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './components': './src/components/index.ts',
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: false,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: false,
            },
          },
        })
      );
    }

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
    return {
      beforeFiles: [
        // Proxy API requests
        {
          source: '/api/:path*',
          destination: process.env.API_URL + '/:path*',
        },
      ],
      afterFiles: [
        // Handle dynamic routes
        {
          source: '/p/:path*',
          destination: '/pages/:path*',
        },
      ],
    };
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
  // Configure build output
  output: 'standalone',
  
  // Configure compression
  compress: true,

  // Configure build indicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Configure runtime configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: process.env.MY_SECRET,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },

  // Configure build optimization
  optimizeFonts: true,
  productionBrowserSourceMaps: false,
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