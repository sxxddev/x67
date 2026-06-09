import crypto from "crypto"
import type { Prisma } from "@prisma/client"

const KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase().replace(/\s+/g, "")
}

export function generateLicenseKeyString(): string {
  const segment = () =>
    Array.from({ length: 4 }, () => KEY_CHARS[crypto.randomInt(KEY_CHARS.length)]).join("")
  return `X67-${segment()}-${segment()}-${segment()}`
}

type TxClient = Prisma.TransactionClient | {
  licenseKey: {
    findUnique: (args: { where: { key: string } }) => Promise<{ id: string } | null>
  }
}

export async function generateUniqueLicenseKey(client: TxClient): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const key = generateLicenseKeyString()
    const exists = await client.licenseKey.findUnique({ where: { key } })
    if (!exists) return key
  }
  throw new Error("FAILED_TO_GENERATE_LICENSE_KEY")
}

export function computeLicenseExpiry(days: number | null | undefined): Date | null {
  if (!days || days <= 0) return null
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

export function maskLicenseKey(key: string): string {
  const normalized = normalizeLicenseKey(key)
  if (normalized.length <= 8) return "****"
  return `${normalized.slice(0, 7)}****${normalized.slice(-4)}`
}

export function getLicenseApiSecret(): string | null {
  return process.env.LICENSE_API_SECRET?.trim() || null
}

export function licenseCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-License-Secret",
  }
}
