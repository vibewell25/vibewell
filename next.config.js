/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  "reactStrictMode": true,
  "images": {
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "**"
      }
    ],
    "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384],
    "formats": ['image/avif', 'image/webp'],
    "minimumCacheTTL": 60,
    "dangerouslyAllowSVG": true,
    "contentSecurityPolicy": "default-src 'self'; script-src 'none'; sandbox;",
    "domains": ['your-cdn-domain.com'],
  },
  "experimental": {
    "serverActions": {
      "bodySizeLimit": "2mb"
    },
    "typedRoutes": true,
    "optimizeCss": true,
    "optimizePackageImports": [
      '@radix-ui/react-icons',
      '@heroicons/react',
      'lucide-react',
      'date-fns',
      '@react-three/drei'
    ],
    "webVitalsAttribution": ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
    "scrollRestoration": true,
    "workerThreads": true,
    "outputStandalone": true,
  },
  "typescript": {
    "ignoreBuildErrors": false,
    "tsconfigPath": "./tsconfig.json"
  },
  "eslint": {
    "ignoreDuringBuilds": true
  },
  "output": "standalone",
  "compress": true,
  "headers": async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.CONTENT_SECURITY_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://*.stripe.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests; block-all-mixed-content;"
          },
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
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=(), payment=(self)'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/ar/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ]
      }
    ];
  },
  // Enable SWR by default
  swcMinify: true,
  // Increase security of generated source maps
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Enforce HTTPS in production
  async rewrites() {
    return process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/:path*',
            has: [
              {
                type: 'header',
                key: 'x-forwarded-proto',
                value: '(?!https)'
              }
            ],
            destination: 'https://$host/$1'
          }
        ]
      : [];
  },
  "onDemandEntries": {
    "maxInactiveAge": 60 * 60 * 1000,
    "pagesBufferLength": 5,
  },
  "compiler": {
    "removeConsole": process.env.NODE_ENV === 'production',
  },
  "webpack": (config, { dev, isServer }) => {
    // Enable aggressive code splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          chunks: 'all',
          name: 'framework',
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
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
            return hash.digest('hex').slice(0, 8);
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
              .digest('hex') + '-shared';
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
    };

    // Optimize AR assets
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/ar-assets/',
          outputPath: 'static/ar-assets/',
        },
      },
    });

    // Add performance budgets in production
    if (!dev) {
      config.performance = {
        maxEntrypointSize: 400000, // 400KB
        maxAssetSize: 300000, // 300KB
        hints: 'warning',
      };
    }

    return config;
  },
  "redirects": async () => {
    return [
      {
        source: '/ar-experience',
        destination: '/ar/experience',
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);