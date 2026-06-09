import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import bcrypt from "bcrypt"

function createPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  const url = new URL(connectionString)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port, 10) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.substring(1)),
    connectionLimit: 5,
    connectTimeout: 10000,
  })

  return new PrismaClient({ adapter })
}

const prisma = createPrisma()

const username = process.env.SEED_ADMIN_USERNAME || "admin"
const password = process.env.SEED_ADMIN_PASSWORD || "Admin@x67secret"

async function main() {
  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      role: "ADMIN",
      password: hashed,
    },
    create: {
      username,
      email: "owner@x67secretme.local",
      password: hashed,
      role: "ADMIN",
      balance: 1_000_000,
      points: 0,
      name: "เจ้าของเว็บ",
    },
    select: { id: true, username: true, role: true, balance: true },
  })

  console.log(
    `[seed] บัญชีเจ้าของพร้อมใช้ — username: ${user.username}, role: ${user.role}, balance: ${user.balance}`
  )
  console.log(
    `[seed] รหัสผ่าน: ใช้ค่าใน SEED_ADMIN_PASSWORD (.env) หรือค่าเริ่มต้น Admin@x67secret`
  )
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
