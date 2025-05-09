const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  basePath: '',
  // Configure proper image domains and patterns
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '**',
      }
    ]
  },
  // Customize Webpack
  webpack: (config) => {
    // Ensure resolve and alias objects exist
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      'ui': path.resolve(__dirname, '../../packages/ui'),
      'services': path.resolve(__dirname, '../../packages/services'),
      'types': path.resolve(__dirname, '../../packages/types'),
      'config': path.resolve(__dirname, '../../packages/config'),
      'test-utils': path.resolve(__dirname, '../../packages/test-utils'),
    };
    
    return config;
  }
};

module.exports = nextConfig; 