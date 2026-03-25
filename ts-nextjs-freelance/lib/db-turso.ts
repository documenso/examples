/**
 * Turso-specific Prisma Client setup
 * Use this file in production environments when connecting to Turso
 *
 * To use:
 * 1. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment
 * 2. Import from this file instead of lib/db.ts
 */

import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
