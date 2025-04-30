/** @type {import('next').NextConfig} */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack(config) {
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(
      new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, 'tsconfig.json') })
    );
    return config;
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'app.getvibewell.com',
            },
          ],
          destination: '/app/:path*',
        },
      ],
    }
  },
  images: {
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig;