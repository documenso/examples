import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For local SQLite development, use standard PrismaClient
// For Turso production with auth token, the adapter would be used
// (Next.js externalizes these packages to avoid bundling issues)
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
