import type { NextConfig } from "next";
import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack(config) {
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(
      new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, 'tsconfig.json') })
    );
    return config;
  },
  /* config options here */
};

export default nextConfig;
