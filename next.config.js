/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add domains you need to load images from
  },
  // Add any other Next.js config options here
};

module.exports = nextConfig; 