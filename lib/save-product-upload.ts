import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"

/** เก็บนอก public — Next.js production เสิร์ฟ public แค่ไฟล์ที่มีตอน build */
export const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "products")

export const PRODUCT_UPLOAD_URL_PREFIX = "/uploads/products"

const MAX_BYTES = 5 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

export const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
}

export function isDiscordCdnUrl(value: string | null | undefined): boolean {
  if (!value) return false
  try {
    const host = new URL(value).hostname.toLowerCase()
    return (
      host === "cdn.discordapp.com" ||
      host === "media.discordapp.net" ||
      host.endsWith(".discordapp.com") ||
      host.endsWith(".discordapp.net")
    )
  } catch {
    return false
  }
}

export function isLocalProductUpload(value: string | null | undefined): boolean {
  return !!value?.trim().startsWith(`${PRODUCT_UPLOAD_URL_PREFIX}/`)
}

export async function saveProductImageUpload(file: File): Promise<string> {
  const ext = MIME_TO_EXT[file.type]
  if (!ext) {
    throw new Error("รองรับเฉพาะ PNG, JPG, WEBP, GIF")
  }
  if (file.size > MAX_BYTES) {
    throw new Error("ไฟล์ใหญ่เกิน 5MB")
  }

  await fs.mkdir(PRODUCT_UPLOAD_DIR, { recursive: true })
  const filename = `${randomUUID()}${ext}`
  const filepath = path.join(PRODUCT_UPLOAD_DIR, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filepath, buffer)

  return `${PRODUCT_UPLOAD_URL_PREFIX}/${filename}`
}

export async function saveProductImageFromUrl(sourceUrl: string): Promise<string | null> {
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "x67secretme-image-migrator/1.0" },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) return null

  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? ""
  const ext = MIME_TO_EXT[contentType]
  if (!ext) return null

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) return null

  await fs.mkdir(PRODUCT_UPLOAD_DIR, { recursive: true })
  const filename = `${randomUUID()}${ext}`
  await fs.writeFile(path.join(PRODUCT_UPLOAD_DIR, filename), buffer)
  return `${PRODUCT_UPLOAD_URL_PREFIX}/${filename}`
}

export function resolveUploadFilename(filename: string): string | null {
  const base = path.basename(filename)
  if (!base || base !== filename || base.includes("..")) return null
  const ext = path.extname(base).toLowerCase()
  if (!EXT_TO_MIME[ext]) return null
  return base
}

export function getProductUploadFilePath(filename: string): string {
  return path.join(PRODUCT_UPLOAD_DIR, filename)
}
