import type { LicenseKey, LicenseKeyStatus, Prisma } from "@prisma/client"
import {
  computeLicenseExpiry,
  generateUniqueLicenseKey,
  normalizeLicenseKey,
} from "@/lib/license-key"
import { prisma } from "@/lib/prisma"

type TxClient = Prisma.TransactionClient

export type LicenseValidateResult =
  | { ok: true; expiresAt: Date | null; productName: string }
  | { ok: false; error: string }

function isExpired(license: LicenseKey): boolean {
  return license.expiresAt != null && license.expiresAt < new Date()
}

async function markExpiredIfNeeded(
  client: TxClient | typeof prisma,
  license: LicenseKey
): Promise<LicenseKey> {
  if (license.status === "ACTIVE" && isExpired(license)) {
    return client.licenseKey.update({
      where: { id: license.id },
      data: { status: "EXPIRED" },
    })
  }
  return license
}

export async function validateAndBindLicense(params: {
  key: string
  hwid: string
  productId?: string
  client?: TxClient | typeof prisma
}): Promise<LicenseValidateResult> {
  const db = params.client ?? prisma
  const normalizedKey = normalizeLicenseKey(params.key)
  const hwid = params.hwid.trim()

  if (!normalizedKey || normalizedKey.length < 8) {
    return { ok: false, error: "License Key ไม่ถูกต้อง" }
  }
  if (!hwid || hwid.length < 4) {
    return { ok: false, error: "HWID ไม่ถูกต้อง" }
  }

  const license = await db.licenseKey.findUnique({
    where: { key: normalizedKey },
    include: { product: { select: { name: true, isActive: true } } },
  })

  if (!license) {
    return { ok: false, error: "ไม่พบ License Key" }
  }

  if (!license.product.isActive) {
    return { ok: false, error: "สินค้านี้ปิดการขายแล้ว" }
  }

  if (params.productId && license.productId !== params.productId) {
    return { ok: false, error: "Key ไม่ตรงกับสินค้านี้" }
  }

  const current = await markExpiredIfNeeded(db, license)

  if (current.status === "REVOKED") {
    return { ok: false, error: "Key ถูกยกเลิกแล้ว" }
  }
  if (current.status === "EXPIRED" || isExpired(current)) {
    return { ok: false, error: "Key หมดอายุแล้ว" }
  }
  if (current.status !== "ACTIVE") {
    return { ok: false, error: "Key ไม่สามารถใช้งานได้" }
  }

  if (!current.hwid) {
    await db.licenseKey.update({
      where: { id: current.id },
      data: { hwid, lastValidatedAt: new Date() },
    })
  } else if (current.hwid !== hwid) {
    return { ok: false, error: "HWID ไม่ตรงกัน — ใช้รีเซ็ต HWID บนเว็บ" }
  } else {
    await db.licenseKey.update({
      where: { id: current.id },
      data: { lastValidatedAt: new Date() },
    })
  }

  return {
    ok: true,
    expiresAt: current.expiresAt,
    productName: license.product.name,
  }
}

export async function resetLicenseHwid(params: {
  key: string
  productId?: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedKey = normalizeLicenseKey(params.key)

  const license = await prisma.licenseKey.findUnique({
    where: { key: normalizedKey },
  })

  if (!license) {
    return { ok: false, error: "ไม่พบ License Key ในระบบ" }
  }

  if (params.productId && license.productId !== params.productId) {
    return { ok: false, error: "Key ไม่ตรงกับโปรแกรมนี้" }
  }

  if (license.status === "REVOKED") {
    return { ok: false, error: "Key ถูกยกเลิกแล้ว" }
  }
  if (license.status === "EXPIRED" || isExpired(license)) {
    return { ok: false, error: "Key หมดอายุแล้ว" }
  }

  await prisma.licenseKey.update({
    where: { id: license.id },
    data: { hwid: null },
  })

  return { ok: true }
}

export async function createLicenseKeysForOrder(
  tx: TxClient,
  params: {
    productId: string
    userId: number
    orderId: number
    quantity: number
    durationDays?: number | null
  }
): Promise<string[]> {
  const keys: string[] = []
  const expiresAt = computeLicenseExpiry(params.durationDays)

  for (let i = 0; i < params.quantity; i++) {
    const key = await generateUniqueLicenseKey(tx)
    await tx.licenseKey.create({
      data: {
        key,
        productId: params.productId,
        userId: params.userId,
        orderId: params.orderId,
        status: "ACTIVE" satisfies LicenseKeyStatus,
        durationDays: params.durationDays ?? null,
        expiresAt,
      },
    })
    keys.push(key)
  }

  return keys
}

export async function bulkGenerateLicenseKeys(params: {
  productId: string
  count: number
  durationDays?: number | null
  note?: string | null
}): Promise<string[]> {
  const count = Math.min(Math.max(params.count, 1), 500)
  const expiresAt = computeLicenseExpiry(params.durationDays ?? null)
  const keys: string[] = []

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < count; i++) {
      const key = await generateUniqueLicenseKey(tx)
      await tx.licenseKey.create({
        data: {
          key,
          productId: params.productId,
          status: "ACTIVE",
          durationDays: params.durationDays ?? null,
          expiresAt,
          note: params.note ?? null,
        },
      })
      keys.push(key)
    }
  })

  return keys
}
