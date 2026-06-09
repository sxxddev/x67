import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

function createPrisma() {
  const url = new URL(process.env.DATABASE_URL)
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port, 10) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.substring(1)),
  })
  return new PrismaClient({ adapter })
}

const prisma = createPrisma()

const phone = process.env.ANGPAO_RECEIVER_PHONE?.trim() || "0926418809"
const apiUrl =
  process.env.ANGPAO_REDEEM_API_URL?.trim() ||
  "http://apitrue.vornyx.pro/truemoney"

await prisma.siteSettings.upsert({
  where: { id: "default" },
  create: {
    id: "default",
    angpaoEnabled: true,
    angpaoAutoApprove: true,
    angpaoApiEndpoint: apiUrl,
    angpaoReceiverPhone: phone,
    angpaoAllowedHosts: "gift.truemoney.com,tmn.app",
  },
  update: {
    angpaoEnabled: true,
    angpaoAutoApprove: true,
    angpaoApiEndpoint: apiUrl,
    angpaoReceiverPhone: phone,
  },
})

console.log("Angpao Vornyx settings updated:")
console.log("  API:", apiUrl)
console.log("  Receiver phone:", phone)
console.log("  Auto approve: ON")
console.log("")
console.log("ทดสอบที่ /topup/angpao — วางลิงก์ซองแล้วกดเติมเงินทันที")

await prisma.$disconnect()
