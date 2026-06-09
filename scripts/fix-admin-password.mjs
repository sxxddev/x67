import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const url =
  process.env.DATABASE_URL ||
  "mysql://root:0831217518@localhost:3306/x67projectofficial"

const adapter = new PrismaMariaDb(url)
const prisma = new PrismaClient({ adapter })

const username = process.argv[2] || "admin"
const password = process.argv[3] || "x67admin2026"

const hash = await bcrypt.hash(password, 10)
const user = await prisma.user.update({
  where: { username },
  data: { password: hash, role: "ADMIN" },
  select: { id: true, username: true, role: true },
})

const ok = await bcrypt.compare(password, hash)
console.log("Updated:", user)
console.log("Password verify:", ok)

await prisma.$disconnect()
