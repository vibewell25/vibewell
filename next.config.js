/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    typedRoutes: true,
  },
  // Skip type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use standalone output
  output: 'standalone',
  
  // Webpack configuration for polyfills
  webpack: (config, { isServer }) => {
    // Add polyfills for node modules used by Redis and other services
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        path: false,
        stream: false,
        child_process: false,
        http: false,
        https: false,
        zlib: false,
        os: false,
        url: false,
        querystring: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 