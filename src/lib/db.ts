import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalDb = globalThis as unknown as { furnipropDb?: PrismaClient };

export const db = globalDb.furnipropDb ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

if (process.env.NODE_ENV !== 'production') globalDb.furnipropDb = db;
