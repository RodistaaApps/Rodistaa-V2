/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rodistaa/app-shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1',
  },
  // Rodistaa theme configuration
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig
