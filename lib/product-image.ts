/** Placeholder รูปสินค้า — โฮสต์บนเว็บเอง */
export const PRODUCT_IMAGE_PLACEHOLDER = "/product-placeholder.svg"

/** ค่า image จากฟอร์ม admin — URL หรือ data URL (เก็บใน LongText) */
export function normalizeProductImage(value: unknown): string | null {
  if (value == null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null

  const maxLen = 2_000_000
  if (trimmed.length > maxLen) {
    throw new Error(
      "ลิงก์รูปภาพยาวเกินไป กรุณาใช้ URL สั้นๆ หรือโฮสต์รูปภายนอก"
    )
  }

  if (trimmed.startsWith("data:") && trimmed.length > 800_000) {
    throw new Error(
      "รูปแบบ base64 ใหญ่เกินไป กรุณาใช้ลิงก์ URL (https://...) แทน"
    )
  }

  return trimmed
}

/** แปลง URL รูปสินค้าให้โหลดได้จากทุก client + ใช้ placeholder เมื่อว่าง */
export function resolveProductImageUrl(
  value: string | null | undefined,
  placeholder = PRODUCT_IMAGE_PLACEHOLDER
): string {
  const raw = value?.trim()
  if (!raw) return placeholder

  if (raw.startsWith("data:")) return raw

  if (raw.startsWith("//")) {
    return `https:${raw}`
  }

  if (raw.startsWith("http://")) {
    return `https://${raw.slice("http://".length)}`
  }

  if (raw.startsWith("https://")) {
    try {
      const url = new URL(raw)
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith(".local")
      ) {
        return url.pathname + url.search
      }
    } catch {
      return placeholder
    }
    return raw
  }

  if (raw.startsWith("/")) return raw

  return raw
}
