import "dotenv/config"
import crypto from "crypto"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

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

const UPLOAD_DIR = path.join(root, "data", "uploads", "products")
const LEGACY_UPLOAD_DIR = path.join(root, "public", "uploads", "products")
const UPLOAD_URL_PREFIX = "/uploads/products"
const MAX_BYTES = 5 * 1024 * 1024

const MIME_TO_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value)
}

function isLocalUpload(value) {
  return value.startsWith(`${UPLOAD_URL_PREFIX}/`)
}

async function downloadToUploads(sourceUrl) {
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "x67secretme-image-migrator/1.0" },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? ""
  const ext = MIME_TO_EXT[contentType]
  if (!ext) {
    return { ok: false, status: "bad-type" }
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) {
    return { ok: false, status: "too-large" }
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const filename = `${crypto.randomUUID()}${ext}`
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer)
  return { ok: true, url: `${UPLOAD_URL_PREFIX}/${filename}` }
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true },
  })

  let migrated = 0
  let skipped = 0
  let broken = 0

  for (const product of products) {
    const image = product.image?.trim()
    if (!image) {
      skipped++
      continue
    }
    if (isLocalUpload(image)) {
      skipped++
      continue
    }
    if (!isExternalUrl(image)) {
      skipped++
      continue
    }

    console.log(`\n[${product.name}]`)
    console.log(`  from: ${image.slice(0, 90)}...`)

    const result = await downloadToUploads(image)
    if (!result.ok) {
      console.log(`  FAIL (${result.status}) — re-upload in admin`)
      broken++
      continue
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { image: result.url },
    })
    console.log(`  OK -> ${result.url}`)
    migrated++
  }

  console.log(`\nDone: migrated=${migrated} skipped=${skipped} broken=${broken}`)
  if (broken > 0) {
    console.log("Broken images need new upload: Admin > Products > edit > Upload image")
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
