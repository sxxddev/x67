import "dotenv/config"
import crypto from "crypto"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

function createPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL is not set")
  const url = new URL(connectionString)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port, 10) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.substring(1)),
    connectionLimit: 5,
  })
  return new PrismaClient({ adapter })
}

const prisma = createPrisma()

const KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
function generateKey() {
  const seg = () =>
    Array.from({ length: 4 }, () => KEY_CHARS[crypto.randomInt(KEY_CHARS.length)]).join("")
  return `X67-${seg()}-${seg()}-${seg()}`
}

async function main() {
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, generatesLicenseKey: true },
  })

  if (!product) {
    console.error("No active product — create one in /admin/products first.")
    process.exit(1)
  }

  let key = generateKey()
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.licenseKey.findUnique({ where: { key } })
    if (!exists) break
    key = generateKey()
  }

  await prisma.licenseKey.create({
    data: {
      key,
      productId: product.id,
      status: "ACTIVE",
      note: "test key — npm run license:test-setup",
    },
  })

  const secret = process.env.LICENSE_API_SECRET?.trim()
  const baseUrl = process.env.AUTH_URL?.trim() || "http://localhost:3000"

  console.log("")
  console.log("=== License API test setup ===")
  console.log("")
  console.log("Product:", product.name)
  console.log("productId:", product.id)
  console.log("License Key:", key)
  console.log("LICENSE_API_SECRET:", secret || "(not set in .env)")
  console.log("Base URL:", baseUrl)
  console.log("")
  console.log("Test (PowerShell):")
  console.log(`curl.exe -X POST "${baseUrl}/api/license/validate" \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(`  -H "X-License-Secret: ${secret}" \\`)
  console.log(`  -d "{\\"key\\":\\"${key}\\",\\"hwid\\":\\"TEST-HWID-001\\",\\"productId\\":\\"${product.id}\\"}"`)
  console.log("")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
