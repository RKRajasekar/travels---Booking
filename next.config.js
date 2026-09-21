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

const defaultDbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
    ? process.env.DATABASE_URL
    : 'mongodb+srv://rajasekar:admin@cluster0.b020vtu.mongodb.net/nextbus?retryWrites=true&w=majority';
process.env.DATABASE_URL = defaultDbUrl;

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    NEXTAUTH_URL: resolvedNextAuthUrl,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '35cf08872b0c3639a06141a8775f0a20a455a5dc62ce9d90ec9ff411a0bf1838',
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '35cf08872b0c3639a06141a8775f0a20a455a5dc62ce9d90ec9ff411a0bf1838',
    DATABASE_URL: defaultDbUrl,
  },
};

module.exports = nextConfig;
