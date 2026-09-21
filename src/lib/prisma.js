import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const defaultDbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
    ? process.env.DATABASE_URL
    : 'mongodb+srv://rajasekar:admin@cluster0.b020vtu.mongodb.net/nextbus?retryWrites=true&w=majority';

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: defaultDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
