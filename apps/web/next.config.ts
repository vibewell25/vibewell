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
      },
    ],
  },
  webpack(config) {
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    // Alias for components and hooks directories
    config.resolve.alias['@components'] = path.resolve(__dirname, 'src/components');
    config.resolve.alias['@hooks'] = path.resolve(__dirname, 'src/hooks');
    // Aliases for shared packages
    config.resolve.alias['ui'] = path.resolve(__dirname, '../../packages/ui');
    config.resolve.alias['services'] = path.resolve(__dirname, '../../packages/services');
    config.resolve.alias['types'] = path.resolve(__dirname, '../../packages/types');
    config.resolve.alias['config'] = path.resolve(__dirname, '../../packages/config');
    config.resolve.alias['test-utils'] = path.resolve(__dirname, '../../packages/test-utils');
    if (!config.resolve.plugins) {
      config.resolve.plugins = [];
    }
    
    config.resolve.plugins.push(
      new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, 'tsconfig.json') })
    );
    
    return config;
  },
  /* config options here */
};

export default nextConfig;
