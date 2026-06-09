import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

/** เปลี่ยน key เมื่ออัปเดต schema — บังคับสร้าง PrismaClient ใหม่หลัง prisma generate */
const globalForPrisma = global as unknown as { prisma_v8_product_options: PrismaClient }

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  // Parse the connection string to extract credentials
  const url = new URL(connectionString)

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.substring(1)),
    connectionLimit: 10,
    connectTimeout: 10000,
  })

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  })
}

export const prisma = globalForPrisma.prisma_v8_product_options || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma_v8_product_options = prisma
}
