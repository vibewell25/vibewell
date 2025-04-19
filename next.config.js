/** @type {import('next').NextConfig} */
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
            value: 'max-age=31536000; includeSubDomains'
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
            value: 'strict-origin-when-cross-origin'
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
      // Add additional module directories
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