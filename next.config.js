/** @type {import('next').NextConfig} */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const crypto = require('crypto');

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
    ],
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
    ],
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
      }
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
            },
            format: {
              comments: false,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              return crypto
                .createHash('sha1')
                .update(
                  chunks.reduce((acc, chunk) => acc + chunk.name, '')
                )
                .digest('hex');
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Add bundle analyzer in production
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
          generateStatsFile: true,
          statsFilename: isServer 
            ? './analyze/server-stats.json' 
            : './analyze/client-stats.json',
          reportFilename: isServer
            ? './analyze/server.html'
            : './analyze/client.html',
          statsOptions: {
            context: './src',
            excludeModules: /[\\/]node_modules[\\/]/,
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
};

module.exports = nextConfig;