import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// @libsql/client works both locally (file: URL, no token needed) and against
// a hosted Turso database (libsql:// URL + auth token) — same adapter either way.
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * A brand-new client with its own connection, bypassing the shared `prisma`
 * singleton — some routes on a long-warm serverless instance were seeing a
 * stuck/stale read view over Turso's remote connection (row counts frozen
 * from minutes earlier despite confirmed-fresh writes elsewhere). Use this
 * for reads where "correct right now" matters more than the small overhead
 * of opening a new connection per call.
 */
export function createFreshPrismaClient() {
  const freshAdapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
    authToken: process.env.DATABASE_AUTH_TOKEN
  });
  return new PrismaClient({ adapter: freshAdapter });
}
