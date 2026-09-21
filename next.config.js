/** @type {import('next').NextConfig} */

// Normalize and sanitize NEXTAUTH_URL so it is NEVER an empty string (which crashes NextAuth parseUrl with ERR_INVALID_URL)
const getNextAuthUrl = () => {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.startsWith('http') ? envUrl.trim() : `https://${envUrl.trim()}`;
  }
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim().length > 0) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return 'http://localhost:3000';
};

const resolvedNextAuthUrl = getNextAuthUrl();
process.env.NEXTAUTH_URL = resolvedNextAuthUrl;

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    NEXTAUTH_URL: resolvedNextAuthUrl,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'nextbus-super-secret-production-key-2024',
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'nextbus-super-secret-production-key-2024',
  },
};

module.exports = nextConfig;
