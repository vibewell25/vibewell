import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.getvibewell.com', 'vibewell.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
experimental: {
    optimizeCss: true,
    scrollRestoration: true,
// Allow both pages and app directories
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
module.exports = nextConfig 