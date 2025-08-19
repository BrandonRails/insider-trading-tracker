/**
 * Prisma Client Configuration - Production Ready
 * Connection pooling, logging, and performance optimization
 */

import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma Client to prevent connection exhaustion
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
    
    // Connection configuration for production
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Error formatting
    errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})