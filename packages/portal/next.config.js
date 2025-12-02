/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rodistaa/app-shared'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Type safety improvements are follow-up work.
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1',
  },
  // Rodistaa theme configuration
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig
