/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    // Remove Firebase Storage domain
  },
  // API routes are now handled internally by Next.js
  // No need for external API rewrites
}

module.exports = nextConfig