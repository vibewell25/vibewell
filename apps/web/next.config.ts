import type { NextConfig } from "next";
import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const nextConfig: NextConfig = {
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
    
    // Add TsconfigPathsPlugin to resolve plugin list
    const plugins = config.resolve.plugins ?? [];
    plugins.push(
      new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, 'tsconfig.json') })
    );
    config.resolve.plugins = plugins;
    return config;
  }
};

export default nextConfig;
